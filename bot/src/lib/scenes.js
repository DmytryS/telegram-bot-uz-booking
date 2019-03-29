import WizardScene from 'telegraf/scenes/wizard';
import { Extra, Markup } from 'telegraf';
import moment from 'moment';
import UzClient from 'uz-booking-client';
import messages from './messages';
import { logger } from '../services';
import { User, Job } from '../models';
import { print } from '../utils';
import { dateSelectEmitter, calendar } from '../app';

const sceneLogger = logger.getLogger('Scene');
const sendErrorMessage = (ctx, message) =>
  ctx.reply(`${messages[ctx.session.language].errorOccured}\n${message}`);

const initialScene = new WizardScene('initialScene', ctx => {
  ctx.reply(
    messages[ctx.session.language].letsTryAgain,
    Markup.inlineKeyboard([
      Markup.callbackButton(
        messages[ctx.session.language].findTickets,
        'FIND_DIRECT_TICKETS'
      ),
      Markup.callbackButton(
        messages[ctx.session.language].setLanguage,
        'SET_LANGUAGE'
      ),
      Markup.callbackButton(messages[ctx.session.language].help, 'HELP')
    ]).extra()
  );

  ctx.scene.leave();
});

const setLanguage = new WizardScene(
  'setlanguage',
  ctx => {
    ctx.session.languages = {
      '🇬🇧 English': 'en',
      '🇷🇺 Русский': 'ru',
      '🇺🇦 Українська': 'uk'
    };

    ctx.reply(
      messages[ctx.session.language].choseLanguage,
      Extra.markup(
        Markup.keyboard(['🇬🇧 English', '🇷🇺 Русский', '🇺🇦 Українська'])
          .oneTime()
          .resize()
      )
    );

    ctx.wizard.next();
  },
  async ctx => {
    ctx.session.language = ctx.session.languages[ctx.message.text];

    await User.updateOne(
      {
        telegramId: ctx.update.message.from.id
      },
      {
        language: ctx.session.languages[ctx.message.text]
      }
    );

    ctx.scene.enter('initialScene');
  }
);

const selectDepartureStation = new WizardScene(
  'selectDepartureStation',
  ctx => {
    ctx.reply(messages[ctx.session.language].enterDepartureStation);

    return ctx.wizard.next();
  },
  async ctx => {
    let stations = [];

    try {
      const uzClient = new UzClient(ctx.session.language);
      const response = await uzClient.Station.find(ctx.message.text);

      stations = response.data;
    } catch (err) {
      sceneLogger.error('An error occured during departure station fetch', err);
      sendErrorMessage(ctx);
      ctx.reply(messages[ctx.session.language].enterDepartureStation);

      return;
    }

    if (stations.length === 0) {
      ctx.reply(messages[ctx.session.language].stationNotExists);
      ctx.reply(messages[ctx.session.language].enterDepartureStation);

      return;
    }
    ctx.session.stations = stations;

    ctx.reply(
      messages[ctx.session.language].choseStation,
      Extra.markup(
        Markup.keyboard(stations.map(station => station.title))
          .oneTime()
          .resize()
      )
    );

    ctx.wizard.next();
  },
  ctx => {
    const departureStation = ctx.session.stations.find(
      station => station.title === ctx.message.text
    );

    if (!departureStation) {
      ctx.reply(messages[ctx.session.language].choseStation);

      return;
    }

    ctx.session.departureStation = departureStation.value;
    ctx.session.departureStationName = ctx.message.text;

    delete ctx.session.stations;

    ctx.scene.enter('selectArrivalStation');
  }
);

const selectArrivalStation = new WizardScene(
  'selectArrivalStation',
  ctx => {
    ctx.reply(messages[ctx.session.language].enterArrivalStation);

    return ctx.wizard.next();
  },
  async ctx => {
    let stations = [];

    try {
      const uzClient = new UzClient(ctx.session.language);
      const response = await uzClient.Station.find(ctx.message.text);

      stations = response.data;
    } catch (err) {
      sceneLogger.error('An error occured during target station fetch', err);
      sendErrorMessage(ctx);
      ctx.reply(messages[ctx.session.language].enterArrivalStation);

      return;
    }

    if (stations.length === 0) {
      ctx.reply(messages[ctx.session.language].stationNotExists);
      ctx.reply(messages[ctx.session.language].enterArrivalStation);

      return;
    }

    ctx.session.stations = stations;

    ctx.reply(
      messages[ctx.session.language].choseStation,
      Extra.markup(
        Markup.keyboard(stations.map(station => station.title))
          .oneTime()
          .resize()
      )
    );

    ctx.wizard.next();
  },
  ctx => {
    const arrivalStation = ctx.session.stations.find(
      station => station.title === ctx.message.text
    );

    if (!arrivalStation) {
      ctx.reply(messages[ctx.session.language].choseStation);

      return;
    }

    ctx.session.arrivalStation = arrivalStation.value;
    ctx.session.arrivalStationName = ctx.message.text;

    delete ctx.session.stations;

    ctx.scene.enter('selectDepartureDate');
  }
);

const selectDepartureDate = new WizardScene(
  'selectDepartureDate',
  ctx => {
    ctx.reply(
      messages[ctx.session.language].choseDepartureDate,
      calendar
        .setMinDate(moment().toDate())
        .setMaxDate(
          moment()
            .add(1, 'month')
            .toDate()
        )
        .getCalendar()
    );

    const onDateSelected = async function onDateSelected(date) {
      ctx.session.departureDate = date;

      ctx.reply(date);

      let trains = [];

      try {
        const uzClient = new UzClient(ctx.session.language);
        let response = false;

        // eslint-disable-next-line
        switch (ctx.session.ticketSearchType) {
          case 'DIRECT':
            response = await uzClient.Train.find(
              ctx.session.departureStation,
              ctx.session.arrivalStation,
              ctx.session.departureDate,
              '00:00'
            );
            break;
          case 'INTERCHANGE':
            response = await uzClient.Train.findInterchange(
              ctx.session.departureStation,
              ctx.session.arrivalStation,
              ctx.session.departureDate,
              '00:00'
            );
            break;
        }

        if (!response || (response.data.data && !response.data.data.list)) {
          throw new Error(response.data.data);
        }

        trains = response.data.data.list;
      } catch (err) {
        sceneLogger.error('An error occured during target station fetch', err);
        sendErrorMessage(ctx, err.message);

        ctx.reply(messages[ctx.session.language].tryAgain);

        return ctx.scene.leave();
      }

      trains = trains.filter(train => train.types.length > 0);

      const inlineKeyboardButtons = [
        [
          Markup.callbackButton(
            messages[ctx.session.language].searchTicketsOnAnotherDate,
            'FIND_ANOTHER_DATE_TICKETS'
          )
        ],
        [
          Markup.callbackButton(
            messages[ctx.session.language].searchAnotherDirectTrains,
            'FIND_DIRECT_TICKETS'
          )
        ],
        [
          Markup.callbackButton(
            messages[ctx.session.language].setLanguage,
            'SET_LANGUAGE'
          )
        ],
        [
          Markup.callbackButton(
            messages[ctx.session.language].remindMeWhenAvailable,
            'REMIND_ME_WHEN_AVAILABLE'
          )
        ]
      ];

      if (trains.length === 0) {
        inlineKeyboardButtons.push([
          Markup.callbackButton(
            messages[ctx.session.language].searchTicketsWithInterchange,
            'FIND_INTERCHANGE_TICKETS'
          )
        ]);
      } else {
        inlineKeyboardButtons.push([
          Markup.callbackButton(
            messages[ctx.session.language].chooseReturn,
            'FIND_RETURN_TICKET'
          )
        ]);
      }

      ctx.reply(
        print.printTrainsList(
          trains,
          ctx.session.departureDate,
          ctx.session.language
        ),
        Markup.inlineKeyboard(inlineKeyboardButtons).extra()
      );

      return ctx.wizard.next();
    };

    const userId =
      (ctx.update.message && ctx.update.message.from.id) ||
      (ctx.update.callback_query && ctx.update.callback_query.from.id);

    dateSelectEmitter.once(`dateSelect-${userId}`, onDateSelected);
  },
  ctx => {
    if (!ctx || !ctx.callbackQuery || !ctx.callbackQuery.data) {
      ctx.scene.leave();
    } else {
      switch (ctx.callbackQuery.data) {
        case 'FIND_ANOTHER_DATE_TICKETS':
          ctx.scene.enter('selectDepartureDate');
          break;
        case 'FIND_DIRECT_TICKETS':
          ctx.session.ticketSearchType = 'DIRECT';
          ctx.scene.enter('selectDepartureStation');
          break;
        case 'SET_LANGUAGE':
          ctx.scene.enter('setlanguage');
          break;
        case 'FIND_INTERCHANGE_TICKETS':
          // TODO
          ctx.session.ticketSearchType = 'INTERCHANGE';
          ctx.scene.enter('selectDepartureDate');
          break;
        case 'REMIND_ME_WHEN_AVAILABLE':
          ctx.scene.enter('selectSeatType');
          break;
        case 'FIND_RETURN_TICKET':
          // eslint-disable-next-line
          const { departureStation } = ctx.session;

          ctx.session.ticketSearchType = 'DIRECT';
          ctx.session.departureStation = ctx.session.arrivalStation;
          ctx.session.arrivalStation = departureStation;
          ctx.scene.enter('selectDepartureDate');
          break;
        default:
          ctx.scene.leave();
          break;
      }
    }
  }
);

const selectSeatType = new WizardScene('selectSeatType', ctx => {
  ctx.session.ticketTypes = ctx.session.ticketTypes || [];

  if (ctx.callbackQuery && ctx.callbackQuery.data === 'NEXT') {
    if (!ctx.session.ticketTypes || ctx.session.ticketTypes.length === 0) {
      ctx.reply(messages[ctx.session.language].selectAtLeastOneSeatType);
    } else {
      ctx.scene.enter('enterNumberOfTickets');
    }
  } else {
    if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
      ctx.session.ticketTypes = [];
    }
    if (
      ctx.callbackQuery &&
      ctx.callbackQuery.data &&
      ctx.callbackQuery.data !== 'REMIND_ME_WHEN_AVAILABLE'
    ) {
      const seatTypeIndex = ctx.session.ticketTypes.indexOf(
        ctx.callbackQuery.data
      );

      if (seatTypeIndex > -1) {
        ctx.session.ticketTypes.splice(seatTypeIndex, 1);
      } else {
        ctx.session.ticketTypes.push(ctx.callbackQuery.data);
      }
    }

    const buttonList = Markup.inlineKeyboard([
      [
        Markup.callbackButton(
          `${ctx.session.ticketTypes.indexOf('COMPARTMENT') > -1 ? '✅ ' : ''}${
            messages[ctx.session.language].compartment
          }`,
          'COMPARTMENT'
        ),
        Markup.callbackButton(
          `${ctx.session.ticketTypes.indexOf('BERTH') > -1 ? '✅ ' : ''}${
            messages[ctx.session.language].berth
          }`,
          'BERTH'
        ),
        Markup.callbackButton(
          `${ctx.session.ticketTypes.indexOf('DE_LUXE') > -1 ? '✅ ' : ''}${
            messages[ctx.session.language].deLuxe
          }`,
          'DE_LUXE'
        )
      ],
      [
        Markup.callbackButton(
          `${
            ctx.session.ticketTypes.indexOf('SEATING_1ST_CLASS') > -1
              ? '✅ '
              : ''
          }${messages[ctx.session.language].seating1stClass}`,
          'SEATING_1ST_CLASS'
        )
      ],
      [
        Markup.callbackButton(
          `${
            ctx.session.ticketTypes.indexOf('SEATING_2ND_CLASS') > -1
              ? '✅ '
              : ''
          }${messages[ctx.session.language].seating2ndClass}`,
          'SEATING_2ND_CLASS'
        )
      ],
      [
        Markup.callbackButton(
          `${
            ctx.session.ticketTypes.indexOf('SEATING_3D_CLASS') > -1 ? '✅' : ''
          }${messages[ctx.session.language].seating3dClass}`,
          'SEATING_3D_CLASS'
        )
      ],
      [Markup.callbackButton(messages[ctx.session.language].next, 'NEXT')]
    ]).extra();

    ctx.reply(messages[ctx.session.language].selectWagonType, buttonList);
  }
});

const enterNumberOfTickets = new WizardScene(
  'enterNumberOfTickets',
  ctx => {
    ctx.reply(messages[ctx.session.language].howManyTicketsYouNeed);

    return ctx.wizard.next();
  },
  async ctx => {
    const amountOfTickets = parseInt(ctx.message.text, 10);

    if (!amountOfTickets) {
      sendErrorMessage(ctx);
      ctx.reply(messages[ctx.session.language].howManyTicketsYouNeed);
    }

    const user = await User.findOne({ telegramId: ctx.from.id });

    await new Job({
      chatId: ctx.from.id,
      user: user._id,
      departureStationId: ctx.session.departureStation,
      departureStationName: ctx.session.departureStationName,
      arrivalStationId: ctx.session.arrivalStation,
      arrivalStationName: ctx.session.arrivalStationName,
      departureDate: ctx.session.departureDate,
      amountOfTickets,
      ticketTypes: ctx.session.ticketTypes
    }).save();

    // await queue.publish(
    //   process.env.WORKER_QUEUE,
    //   'fanout',
    //   JSON.stringify({
    //     jobId: job._id.toString()
    //   })
    // );

    ctx.reply(messages[ctx.session.language].sayWhenAvailable);

    ctx.scene.enter('initialScene');
  }
);

export default {
  initialScene,
  setLanguage,
  selectDepartureStation,
  selectArrivalStation,
  selectDepartureDate,
  selectSeatType,
  enterNumberOfTickets
};
