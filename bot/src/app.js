import {} from 'dotenv/config';
import Telegraf from 'telegraf';
import Stage from 'telegraf/stage';
import telegrafSession from 'telegraf/session';
import Calendar from 'telegraf-calendar-telegram';
import EventEmitter from 'events';
import { logger } from './services';
import { botHandler, scenes, middlewares } from './lib';

const { enter } = Stage;
const appLogger = logger.getLogger('App');
const bot = new Telegraf(process.env.BOT_TOKEN);

export const dateSelectEmitter = new EventEmitter();
export const calendar = new Calendar(bot);

calendar.setDateListener((context, date) => {
    dateSelectEmitter.emit(`dateSelect-${context.update.callback_query.from.id}`, date);
});

const stage = new Stage([ scenes.selectDepartureStation, scenes.selectArrivalStation, scenes.selectDepartureDate, scenes.setLanguage ], { ttl: 60 });

bot.use(telegrafSession());
bot.use(stage.middleware());
bot.use(middlewares.getUserLanguage);


bot.command('finddirecttickets', botHandler.findDirectTickets);
bot.command('findinterchangetickets', botHandler.findInterchangeTickets);
bot.command('setlanguage', botHandler.setLanguage);

bot.action('FIND_DIRECT_TICKETS', enter('finddirecttickets'));
bot.action('SET_LANGUAGE', enter('setlanguage'));

bot.start(botHandler.start);
bot.help(botHandler.help);
bot.catch((err) => {
    appLogger.error('An error occured in app', err);
});
bot.startPolling();
