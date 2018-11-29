import Telegraf, { Extra, Markup, session } from 'telegraf';
import WizardScene from 'telegraf/scenes/wizard';
import Stage from 'telegraf/stage';
import cote from 'cote';
import Calendar from 'telegraf-calendar-telegram';
import moment from 'moment';

const uzClientRequester = new cote.Requester({
    name: 'bot uz requester',
    namespace: 'uz'
});
const bot = new Telegraf(process.env.BOT_TOKEN);
const calendar = new Calendar(bot);


calendar.setDateListener((context, date) => context.reply(date));
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

        ctx.reply('Выберите станцию', Extra.markup(
            Markup
                .keyboard(stations.map((station) => station.title))
                .oneTime()
        ));

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        }

        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.session.departureStation = ctx.message.text;

        ctx.reply('Введите станцию прибытия.');

        return ctx.wizard.next();
    },
    async (ctx) => {
        const stations = await uzClientRequester.send({
            type: 'find-station',
            stationName: ctx.message.text
        });

        if (stations.length === 0) {
            ctx.reply('Такой станции не существует.');
            ctx.wizard.back();
        }

        ctx.reply('Выберите станцию', Extra.markup(
            Markup
                .keyboard(stations.map((station) => station.title))
                .oneTime()
        ));

        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.session.targetStation = ctx.message.text;

        ctx.reply(
            'Выберите дату отправления.',
            calendar
                .setMinDate(moment().toDate())
                .setMaxDate(moment().add(1, 'month').toDate())
                .getCalendar()
        );

        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.session.departureDate = ctx.message.text;
        
        const trains = await uzClientRequester.send({
            type: 'find-train',
            departureStation: ctx.session.departureStation,
            targetStation: ctx.session.departureStation,
            departureDate: ctx.session.departureDate,
            time: '00:00'
        });

        console.log(trains);

        ctx.reply('Выберите поезд.', Extra.markup(
            Markup
                .keyboard(trains.map((train) => train.title))
                .oneTime()
        ));

        return ctx.wizard.next(); // Переходим к следующему обработчику.
    },
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
