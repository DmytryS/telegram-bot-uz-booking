import '@babel/polyfill';
import Telegraf, { Extra, Markup, session } from 'telegraf';
import WizardScene from 'telegraf/scenes/wizard';
import Stage from 'telegraf/stage';
import cote from 'cote';
import Calendar from 'telegraf-calendar-telegram';
import moment from 'moment';
import EventEmitter from 'events';
import languages from './lib/languages';

const dateSelectEmitter = new EventEmitter();

const uzClientRequester = new cote.Requester({
    name: 'uz requester',
    namespace: 'uz-requester'
});
const dbClientRequester = new cote.Requester({
    name: 'db requester',
    namespace: 'db'
});

const bot = new Telegraf(process.env.BOT_TOKEN);
const calendar = new Calendar(bot);

// calendar.setDateListener();

calendar.setDateListener((context, date) => {
    dateSelectEmitter.emit(`dateSelect-${context.update.callback_query.from.id}`, date);
});

const clearSceneState = (ctx) => {
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

// bot.use(Telegraf.log());


const stationScene = new WizardScene(
    'station',
    (ctx) => {
        console.log(ctx.update.message.from);
        
        ctx.reply(languages.en.enterDepartureStation);

        return ctx.wizard.next();
    },
    async (ctx) => {
        let stations = [];
        
        try {
            stations = await uzClientRequester.send({
                type: 'find-station',
                stationName: ctx.message.text
            });
        } catch (err) {
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
            stations = await uzClientRequester.send({
                type: 'find-station',
                stationName: ctx.message.text
            });
        } catch (err) {
            sendErrorMessage(ctx);

            ctx.wizard.back();
        }

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        }else {
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

        dateSelectEmitter.on(`dateSelect-${ctx.update.message.from.id}`, async (date) => {
            ctx.session.departureDate = date;

            console.log('Send date');
                
            ctx.reply(date);

            let trains = await uzClientRequester.send({
                type: 'find-train',
                departureStation: ctx.session.departureStation,
                targetStation: ctx.session.targetStation,
                departureDate: ctx.session.departureDate,
                time: '00:00'
            });

            trains = trains.data.list.filter((train) => train.types.length > 0);


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

            dateSelectEmitter.removeListener(`dateSelect-${ctx.update.message.from.id}`);

            return ctx.scene.leave();
        });
    }
);

const languageScene = new WizardScene(
    'set_language',
    (ctx) => {
        ctx.scene.state.languages = {
            '🇬🇧 English': 'en',
            '🇷🇺 Русский': 'ru',
            '🇺🇦 Українська': 'uk'
        };

        ctx.reply(
            languages.en.choseLanguage,
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
        await dbClientRequester.send({
            type: 'update-user',
            user: {
                telegramId: ctx.update.message.from.id,
                language: ctx.scene.state.languages[ ctx.message.text ]
            }
        });

        console.log(`Set ${ctx.scene.state.languages[ ctx.message.text ]}`);
        

        clearSceneState(ctx);

        return ctx.scene.leave();
    }
);



const stage = new Stage();

stage.register(stationScene);
stage.register(languageScene);

bot.use(session());
bot.use(stage.middleware());
bot.command('station', (ctx) => ctx.scene.enter('station'));
bot.command('set_language', (ctx) => ctx.scene.enter('set_language'));
bot.command('ping', (ctx) => ctx.reply('pong'));

bot.start(async (ctx) => {
    const user = await dbClientRequester.send({
        type: 'create-user',
        user: {
            telegramId: ctx.update.message.from.id,
            firstName: ctx.update.message.from.first_name,
            lastName: ctx.update.message.from.last_name,
            userName: ctx.update.message.from.username
        }
    });

    console.log(user);
    

    ctx.scene.enter('set_language');

    // ctx.reply(
    //     `How can I help you, ${ctx.from.first_name}?`,
    //     Markup.inlineKeyboard([
    //         Markup.callbackButton('💱 Find station', '/station'),
    //         Markup.callbackButton('🤑 View Rates', 'VIEW_RATES')
    //     ]).extra()
    // );
});


bot.startPolling();
