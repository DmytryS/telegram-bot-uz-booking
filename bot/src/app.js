import {} from 'dotenv/config';
import Telegraf from 'telegraf';
import Stage from 'telegraf/stage';
import telegrafSession from 'telegraf/session';
import Calendar from 'telegraf-calendar-telegram';
import EventEmitter from 'events';
import { logger } from './services';
import { botHandler, scenes, middlewares } from './lib';

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
bot.use(middlewares.getUserLanguage);


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
