import WizardScene from 'telegraf/scenes/wizard';
import { Extra, Markup } from 'telegraf';
import moment from 'moment';
import UzClient from 'uz-booking-client';
import messages from './messages';
import { logger } from '../services';
import { User } from '../models';
import { dateSelectEmitter, calendar } from '../app';

const sceneLogger = logger.getLogger('Scene');
const uzClient = new UzClient('ru');

const clearSceneState = () => (ctx) => {
    ctx.scene.state = {};
};

const trainLogo = (category) => {
    switch (category) {
        case 0:
            return '🚂';
        case 1:
            return '🚆';
        case 2:
            return '🚈';
        default:
            return '💁';
    }
};
const sendErrorMessage = (ctx) => ctx.reply('❌ Произошла ошибка.');

const language = new WizardScene(
    'setlanguage',
    (ctx) => {
        ctx.scene.state.languages = {
            '🇬🇧 English': 'en',
            '🇷🇺 Русский': 'ru',
            '🇺🇦 Українська': 'uk'
        };

        ctx.reply(
            messages.ru.choseLanguage,
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
        await User.updateOne(
            {
                telegramId: ctx.update.message.from.id
            },
            {
                language: ctx.scene.state.languages[ ctx.message.text ]
            }
        );

        clearSceneState(ctx);

        return ctx.scene.leave();
    }
)
    .leave(clearSceneState());

const ticket = new WizardScene(
    'findtickets',
    (ctx) => {
        ctx.reply(messages.ru.enterDepartureStation);

        return ctx.wizard.next();
    },
    async (ctx) => {
        let stations = [];

        try {
            const response = await uzClient.Station.find(ctx.message.text);

            stations = response.data;
        } catch (err) {
            sceneLogger.error('An error occured during departure station fetch', err);
            sendErrorMessage(ctx);
            ctx.wizard.back();
        }

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        } else {
            ctx.scene.state.stations = stations;

            ctx.reply(
                'Выберите станцию',
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
        ctx.session.departureStation = ctx.scene.state.stations.find((station) => station.title === ctx.message.text).value;
        clearSceneState(ctx);

        ctx.reply('Введите станцию прибытия.');

        return ctx.wizard.next();
    },
    async (ctx) => {
        let stations = [];

        try {
            const response = await uzClient.Station.find(ctx.message.text);

            stations = response.data;
        } catch (err) {
            sceneLogger.error('An error occured during target station fetch', err);
            sendErrorMessage(ctx);

            ctx.wizard.back();
        }

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        } else {
            ctx.scene.state.stations = stations;

            ctx.reply(
                'Выберите станцию',
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
        ctx.session.targetStation = ctx.scene.state.stations.find((station) => station.title === ctx.message.text).value;
        clearSceneState(ctx);

        ctx.reply(
            'Выберите дату отправления.',
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
                const response = await uzClient.Train.find(
                    ctx.session.departureStation,
                    ctx.session.targetStation,
                    ctx.session.departureDate,
                    '00:00'
                );

                trains = response.data.data.list;
            } catch (err) {
                sceneLogger.error('An error occured during target station fetch', err);
                sendErrorMessage(ctx);

                ctx.wizard.back();
            }

            trains = trains.filter((train) => train.types.length > 0);


            let responseText = `Нашел ${trains.length} поездов на ${ctx.session.departureDate}\n\n`;

            const trainTypes = trains
                .reduce((types, train) => types.findIndex((type) => type === train.category) !== -1 ? types : [ ...types, train.category ], [])
                .sort();

            trainTypes.forEach((type) => {
                const trainCount = trains.filter((train) => train.category === type).length;

                switch (type) {
                    case 0:
                        responseText += `${trainLogo(type)} ${trainCount} - пассажирские\n`;
                        break;
                    case 1:
                        responseText += `${trainLogo(type)} ${trainCount} - скоростные Интерсити+\n`;
                        break;
                    case 2:
                        responseText += `${trainLogo(type)} ${trainCount} - трансформеры\n`;
                        break;
                    default:
                        responseText += `${trainLogo(type)} ${trainCount} - UNKNOWN TYPE\n`;
                }
            });

            trains.forEach((train) => {
                responseText += '\n〰〰〰〰〰〰〰〰\n\n';
                responseText += `${trainLogo(train.category)} ${train.num} ${train.from.station}-${train.to.station}\n`;
                responseText += `🕙 отправление ${train.from.time}\n`;
                responseText += `🕕 прибытие ${train.to.time}\n`;
                responseText += `⌚️ в пути ${train.travelTime}\n\n`;

                train.types.forEach((type) => {
                    responseText += `🎫  ${type.title}: ${type.places}\n`;
                });
            });

            ctx.reply(responseText);

            clearSceneState(ctx);
            return ctx.scene.leave();
        };

        dateSelectEmitter.once(`dateSelect-${ctx.update.message.from.id}`, onDateSelected);
    }
)
    .leave(clearSceneState());

export default {
    language,
    ticket
};
