import {} from 'dotenv/config';
import Telegraf from 'telegraf';
import Stage from 'telegraf/stage';
import telegrafSession from 'telegraf/session';
import Calendar from 'telegraf-calendar-telegram';
import EventEmitter from 'events';
import logger from './services/logger';
import {} from './services/db';
import { User } from './models';
import { botHandler, scenes } from './lib';

const appLogger = logger.getLogger('App');

const bot = new Telegraf(process.env.BOT_TOKEN);

export const dateSelectEmitter = new EventEmitter();
export const calendar = new Calendar(bot);

calendar.setDateListener((context, date) => {
    dateSelectEmitter.emit(`dateSelect-${context.update.callback_query.from.id}`, date);
});

const stage = new Stage();

stage.register(scenes.findDirectTickets);
stage.register(scenes.language);

bot.use(telegrafSession());
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
    if (!ctx.session.language) {
        const telegramId = ctx.from.id;
        const user = await User.findOne({ telegramId });
        const language = user && user.language || 'en';

        ctx.session.language = language;
    }

    await next();
});


bot.command('finddirecttickets', botHandler.findDirectTickets);
bot.command('setlanguage', botHandler.setLanguage);

bot.action('FIND_DIRECT_TICKETS', botHandler.findDirectTickets);
bot.action('SET_LANGUAGE', botHandler.setLanguage);

bot.start(botHandler.start);
bot.help(botHandler.help);
bot.catch((err) => {
    appLogger.error('An error occured in app', err);
});
bot.startPolling();
