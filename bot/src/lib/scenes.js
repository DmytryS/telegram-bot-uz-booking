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
const clearSceneState = () => (ctx) => {
    ctx.scene.state = {};
};
const sendErrorMessage = (ctx) => ctx.reply(messages[ ctx.session.language ].errorOccured);

const language = new WizardScene(
    'setlanguage',
    (ctx) => {
        ctx.scene.state.languages = {
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

        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.session.language = ctx.message.text;

        await User.updateOne(
            {
                telegramId: ctx.update.message.from.id
            },
            {
                language: ctx.scene.state.languages[ ctx.message.text ]
            }
        );

        // clearSceneState(ctx);

        return ctx.scene.leave();
    }
);

const findDirectTickets = new WizardScene(
    'finddirecttickets',
    (ctx) => {
        // clearSceneState(ctx);
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
            ctx.wizard.back();
        }

        if (stations.length === 0) {
            ctx.reply();
            ctx.wizard.back();
        } else {
            ctx.scene.state.stations = stations;

            ctx.reply(
                messages[ ctx.session.language ].choseStation,
                Extra.markup(
                    Markup
                        .keyboard(stations.map((station) => station.title))
                        .oneTime()
                        .resize()
                )
            );
        }

        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.scene.state.departureStation = ctx.scene.state.stations.find((station) => station.title === ctx.message.text).value;


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

            ctx.wizard.back();
        }

        if (stations.length === 0) {
            ctx.reply(messages[ ctx.session.language ].stationNotExists);
            ctx.wizard.back();
        } else {
            ctx.scene.state.stations = stations;

            ctx.reply(
                messages[ ctx.session.language ].choseStation,
                Extra.markup(
                    Markup
                        .keyboard(stations.map((station) => station.title))
                        .oneTime()
                        .resize()
                )
            );
        }


        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.scene.state.targetStation = ctx.scene.state.stations.find((station) => station.title === ctx.message.text).value;
        delete ctx.scene.state.stations;

        ctx.reply(
            messages[ ctx.session.language ].choseDepartureDate,
            calendar
                .setMinDate(moment().toDate())
                .setMaxDate(moment().add(1, 'month').toDate())
                .getCalendar()
        );

        const onDateSelected = async function (date) {
            ctx.scene.state.departureDate = date;

            ctx.reply(date);

            let trains = [];

            try {
                const uzClient = new UzClient(ctx.session.language);
                const response = await uzClient.Train.find(
                    ctx.scene.state.departureStation,
                    ctx.scene.state.targetStation,
                    ctx.scene.state.departureDate,
                    '00:00'
                );

                trains = response.data.data.list;
            } catch (err) {
                sceneLogger.error('An error occured during target station fetch', err);
                sendErrorMessage(ctx);

                ctx.wizard.back();
            }

            trains = trains.filter((train) => train.types.length > 0);


            const inlineKeyboardButtons = [
                [ Markup.callbackButton(messages[ ctx.session.language ].searchTicketsOnAnotherDate, 'FIND_DIRECT_TICKETS') ],
                [ Markup.callbackButton(messages[ ctx.session.language ].searchAnotherDirectTrains, 'FIND_DIRECT_TICKETS') ],
                [ Markup.callbackButton(messages[ ctx.session.language ].setLanguage, 'SET_LANGUAGE') ]
            ];

            if (trains.length === 0) {
                inlineKeyboardButtons.push([ Markup.callbackButton(messages[ ctx.session.language ].searchTicketsWithInterchange, 'FIND_TICKETS') ]);
            }

            ctx.reply(
                print.printTrainsList(
                    trains,
                    ctx.scene.state.departureDate,
                    ctx.session.language
                ),
                Markup.inlineKeyboard(inlineKeyboardButtons).extra()
            );

            clearSceneState(ctx);
            return ctx.scene.leave();
        };

        dateSelectEmitter.once(`dateSelect-${ctx.update.message.from.id}`, onDateSelected);
    },
    // (ctx) => {

    // }
)
    .leave(clearSceneState());

export default {
    language,
    findDirectTickets
};
