import Telegraf, { Extra, Markup, session } from 'telegraf';
import WizardScene from 'telegraf/scenes/wizard';
import Stage from 'telegraf/stage';
import cote from 'cote';
import Calendar from 'telegraf-calendar-telegram';
import moment from 'moment';
import EventEmitter from 'events';

const dateSelectEmitter = new EventEmitter();

const uzClientRequester = new cote.Requester({
    name: 'bot uz requester',
    namespace: 'uz'
});
const bot = new Telegraf(process.env.BOT_TOKEN);
const calendar = new Calendar(bot);

// calendar.setDateListener();

calendar.setDateListener((context, date) => {
    dateSelectEmitter.emit('dateSelect', context.update.callback_query.from.id, date, context);
});

const sceneStateCleaner = (ctx) => {
    ctx.scene.state = {};
};

// bot.use(Telegraf.log());


const stationScene = new WizardScene(
    'station',
    (ctx) => {
        ctx.reply('Введите станцию отправления.');

        return ctx.wizard.next();
    },
    async (ctx) => {
        const stations = await uzClientRequester.send({
            type: 'find-station',
            stationName: ctx.message.text
        });

        ctx.scene.state.stations = stations;

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        } else {
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
        sceneStateCleaner(ctx);

        ctx.reply('Введите станцию прибытия.');

        return ctx.wizard.next();
    },
    async (ctx) => {
        const stations = await uzClientRequester.send({
            type: 'find-station',
            stationName: ctx.message.text
        });

        ctx.scene.state.stations = stations;

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        }else {
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
        sceneStateCleaner(ctx);

        ctx.reply(
            'Выберите дату отправления.',
            calendar
                .setMinDate(moment().toDate())
                .setMaxDate(moment().add(1, 'month').toDate())
                .getCalendar()
        );

        dateSelectEmitter.on('dateSelect', async (chatId, date) => {
            if (ctx.update.message.from.id === chatId) {
                ctx.session.departureDate = date;

                ctx.reply(date);

                const trains = await uzClientRequester.send({
                    type: 'find-train',
                    departureStation: ctx.session.departureStation,
                    targetStation: ctx.session.targetStation,
                    departureDate: ctx.session.departureDate,
                    time: '00:00'
                });


                let responseText = `Нашел ${trains.data.list.length} поездов на ${ctx.session.departureDate}\n\n\n`;

                trains.data.list.forEach((train) => {
                    responseText += '〰〰〰〰〰〰〰〰\n' +
                    `${train.num} ${train.from.station}-${train.to.station}\n` +
                    `отправление ${train.from.time}\n` +
                    `прибытие ${train.to.time}\n` +
                    `в пути ${train.travelTime}\n\n`;
                });
        
                // ctx.reply('Выберите поезд.', Extra.markup(
                //     Markup
                //         .keyboard(trains.map((train) => train.title))
                //         .oneTime()
                // ));
        
                ctx.reply(responseText);

                return ctx.wizard.next(); // Переходим к следующему обработчику.

                // return ctx.wizard.next();
            }
        });
    },
    // async (ctx) => {
    //     const trains = await uzClientRequester.send({
    //         type: 'find-train',
    //         departureStation: ctx.session.departureStation,
    //         targetStation: ctx.session.targetStation,
    //         departureDate: ctx.session.departureDate,
    //         time: '00:00'
    //     });

    //     console.log(1111111111111111111, trains);

    //     ctx.reply('Выберите поезд.', Extra.markup(
    //         Markup
    //             .keyboard(trains.map((train) => train.title))
    //             .oneTime()
    //     ));

    //     return ctx.wizard.next(); // Переходим к следующему обработчику.
    // },
    (ctx) => {
        ctx.reply('Финальный этап: создание матча.');
        return ctx.scene.leave();
    }
);

bot.start((ctx) => {
    ctx.reply(
        `How can I help you, ${ctx.from.first_name}?`,
        Markup.inlineKeyboard([
            Markup.callbackButton('💱 Find station', 'station'),
            Markup.callbackButton('🤑 View Rates', 'VIEW_RATES')
        ]).extra()
    );
});

const stage = new Stage();

stage.register(stationScene);

bot.use(session());
bot.use(stage.middleware());
bot.command('station', (ctx) => ctx.scene.enter('station'));

bot.startPolling();
