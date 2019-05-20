import 'dotenv/config';
import Telegraf from 'telegraf';
import Stage from 'telegraf/stage';
import telegrafSession from 'telegraf/session';
import Calendar from 'telegraf-calendar-telegram';
import EventEmitter from 'events';
import { logger } from './services';
import { botHandler, scenes, middlewares, JobHandler } from './lib';

const appLogger = logger.getLogger('BotApp');
const bot = new Telegraf(process.env.BOT_TOKEN);

export const dateSelectEmitter = new EventEmitter();
export const calendar = new Calendar(bot);

const jobHandler = new JobHandler(bot);

jobHandler.subscribeToQueue(process.env.NOTIFICATIONS_QUEUE);

calendar.setDateListener((context, date) => {
  dateSelectEmitter.emit(
    `dateSelect-${context.update.callback_query.from.id}`,
    date
  );
});

const stage = new Stage(
  [
    scenes.initialScene,
    scenes.selectDepartureStation,
    scenes.selectArrivalStation,
    scenes.selectDepartureDate,
    scenes.setLanguage,
    scenes.selectSeatType,
    scenes.enterNumberOfTickets,
    scenes.getWagons
  ],
  { ttl: 60 }
);

bot.use(telegrafSession());
bot.use(stage.middleware());
bot.use(middlewares.getUserLanguage);

bot.command('finddirecttickets', botHandler.findDirectTickets);
bot.command('findinterchangetickets', botHandler.findInterchangeTickets);
bot.command('setlanguage', botHandler.setLanguage);
bot.command('getwatchers', botHandler.getWatchers);
bot.command('stop', botHandler.stop);
bot.command('help', botHandler.help);

bot.action('FIND_DIRECT_TICKETS', botHandler.findDirectTickets);
bot.action('SET_LANGUAGE', botHandler.setLanguage);
bot.action('GET_WATCHERS', botHandler.getWatchers);
bot.action('HELP', botHandler.help);

bot.hears(/\/stop_watch_(.*)/, botHandler.stopWatch);

bot.start(botHandler.start);
bot.help(botHandler.help);
bot.catch(err => {
  appLogger.error('An error occured in app', err);
});
bot.startPolling();
