import WizardScene from 'telegraf/scenes/wizard';
import { Extra, Markup } from 'telegraf';
import moment from 'moment';
import UzClient from 'uz-booking-client';
import messages from './messages';
import { logger } from '../services';
import { User } from '../models';
import { print } from '../utils';
import { dateSelectEmitter, calendar } from '../app';

const sceneLogger = logger.getLogger('Scene');
const sendErrorMessage = (ctx, message) => ctx.reply(`${messages[ ctx.session.language ].errorOccured}\n${message}`);

const setLanguage = new WizardScene(
    'setlanguage',
    (ctx) => {
        ctx.session.languages = {
            '🇬🇧 English': 'en',
            '🇷🇺 Русский': 'ru',
            '🇺🇦 Українська': 'uk'
        };

        ctx.reply(
            messages[ ctx.session.language ].choseLanguage,
            Extra.markup(
                Markup
                    .keyboard([
                        '🇬🇧 English',
                        '🇷🇺 Русский',
                        '🇺🇦 Українська'
                    ])
                    .oneTime()
                    .resize()
            )
        );

        ctx.wizard.next();
    },
    async (ctx) => {
        ctx.session.language = ctx.session.languages[ ctx.message.text ];

        await User.updateOne(
            {
                telegramId: ctx.update.message.from.id
            },
            {
                language: ctx.session.languages[ ctx.message.text ]
            }
        );

        ctx.scene.leave();
    }
);

const selectDepartureStation = new WizardScene(
    'selectDepartureStation',
    (ctx) => {
        ctx.reply(messages[ ctx.session.language ].enterDepartureStation);

        return ctx.wizard.next();
    },
    async (ctx) => {
        let stations = [];

        try {
            const uzClient = new UzClient(ctx.session.language);
            const response = await uzClient.Station.find(ctx.message.text);

            stations = response.data;
        } catch (err) {
            sceneLogger.error('An error occured during departure station fetch', err);
            sendErrorMessage(ctx);
            ctx.reply(messages[ ctx.session.language ].enterDepartureStation);

            return;
        }

        if (stations.length === 0) {
            ctx.reply(messages[ ctx.session.language ].stationNotExists);
            ctx.reply(messages[ ctx.session.language ].enterDepartureStation);

            return;
        }
        ctx.session.stations = stations;

        ctx.reply(
            messages[ ctx.session.language ].choseStation,
            Extra.markup(
                Markup
                    .keyboard(stations.map((station) => station.title))
                    .oneTime()
                    .resize()
            )
        );


        return ctx.wizard.next();
    },
    (ctx) => {
        const departureStation = ctx.session.stations.find((station) => station.title === ctx.message.text);

        if (!departureStation) {
            ctx.reply(messages[ ctx.session.language ].choseStation);

            return;
        }

        ctx.session.departureStation = departureStation.value;

        return ctx.scene.enter('selectArrivalStation');
    },
);

const selectArrivalStation = new WizardScene(
    'selectArrivalStation',
    (ctx) => {
        ctx.reply(messages[ ctx.session.language ].enterArrivalStation);

        return ctx.wizard.next();
    },
    async (ctx) => {
        let stations = [];

        try {
            const uzClient = new UzClient(ctx.session.language);
            const response = await uzClient.Station.find(ctx.message.text);

            stations = response.data;
        } catch (err) {
            sceneLogger.error('An error occured during target station fetch', err);
            sendErrorMessage(ctx);
            ctx.reply(messages[ ctx.session.language ].enterArrivalStation);

            return;
        }

        if (stations.length === 0) {
            ctx.reply(messages[ ctx.session.language ].stationNotExists);
            ctx.reply(messages[ ctx.session.language ].enterArrivalStation);

            return;
        }

        ctx.session.stations = stations;

        ctx.reply(
            messages[ ctx.session.language ].choseStation,
            Extra.markup(
                Markup
                    .keyboard(stations.map((station) => station.title))
                    .oneTime()
                    .resize()
            )
        );

        return ctx.wizard.next();
    },
    (ctx) => {
        if (!ctx.session.arrivalStation) {
            const arrivalStation = ctx.session.stations.find((station) => station.title === ctx.message.text);

            if (!arrivalStation) {
                ctx.reply(messages[ ctx.session.language ].choseStation);

                return;
            }

            ctx.session.arrivalStation = arrivalStation.value;

            delete ctx.session.stations;
        }

        return ctx.scene.enter('selectDepartureDate');
    }
);

const selectDepartureDate = new WizardScene(
    'selectDepartureDate',
    (ctx) => {
        ctx.reply(
            messages[ ctx.session.language ].choseDepartureDate,
            calendar
                .setMinDate(moment().toDate())
                .setMaxDate(moment().add(1, 'month').toDate())
                .getCalendar()
        );

        const onDateSelected = async function (date) {
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


                if (!response || response.data.data && !response.data.data.list) {
                    throw new Error(response.data.data);
                }

                trains = response.data.data.list;
            } catch (err) {
                sceneLogger.error('An error occured during target station fetch', err);
                sendErrorMessage(ctx, err.message);

                ctx.reply(messages[ ctx.session.language ].tryAgain);

                return ctx.scene.leave();
            }

            trains = trains.filter((train) => train.types.length > 0);


            const inlineKeyboardButtons = [
                [ Markup.callbackButton(messages[ ctx.session.language ].searchTicketsOnAnotherDate, 'FIND_ANOTHER_DATE_TICKETS') ],
                [ Markup.callbackButton(messages[ ctx.session.language ].searchAnotherDirectTrains, 'FIND_DIRECT_TICKETS') ],
                [ Markup.callbackButton(messages[ ctx.session.language ].setLanguage, 'SET_LANGUAGE') ]
            ];

            if (trains.length === 0) {
                inlineKeyboardButtons.push([ Markup.callbackButton(messages[ ctx.session.language ].searchTicketsWithInterchange, 'FIND_INTERCHANGE_TICKETS') ]);
                inlineKeyboardButtons.push([ Markup.callbackButton(messages[ ctx.session.language ].remindMeWhenAvailable, 'REMIND_ME') ]);
            } else {
                inlineKeyboardButtons.push([ Markup.callbackButton(messages[ ctx.session.language ].chooseReturn, 'FIND_RETURN_TICKET') ]);
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

        const userId = (ctx.update.message && ctx.update.message.from.id) || (ctx.update.callback_query && ctx.update.callback_query.from.id);

        dateSelectEmitter.once(`dateSelect-${userId}`, onDateSelected);
    },
    (ctx) => {
        switch (ctx.callbackQuery.data) {
            case 'FIND_ANOTHER_DATE_TICKETS':
                return ctx.scene.enter('selectDepartureDate');
            case 'FIND_INTERCHANGE_TICKETS':
                // TODO
                ctx.session.ticketSearchType = 'INTERCHANGE';
                ctx.scene.enter('selectDepartureDate');
                break;
            case 'REMIND_ME':
                console.log('REMIND_ME TODO');
                break;
            case 'FIND_RETURN_TICKET':
                // eslint-disable-next-line
                const { departureStation } = ctx.session;

                ctx.session.ticketSearchType = 'DIRECT';
                ctx.session.departureStation = ctx.session.arrivalStation;
                ctx.session.arrivalStation = departureStation;
                return ctx.scene.enter('selectDepartureDate');
            default:
                return ctx.scene.leave();
        }
    }
);

const remindWhenTicketsAvailable = new WizardScene(
    'remindWhenTicketsAvailable',
    (ctx) => {
        ctx.reply(messages[ ctx.session.language ].howManyTicketsYouNeed);

        return ctx.wizard.next();
    },
    async (ctx) => {

    }
);

export default {
    setLanguage,
    selectDepartureStation,
    selectArrivalStation,
    selectDepartureDate,
    remindWhenTicketsAvailable
};
