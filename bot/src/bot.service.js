import '@babel/polyfill';
import Telegraf, { Extra, Markup, session } from 'telegraf';
import Stage from 'telegraf/stage';
import Calendar from 'telegraf-calendar-telegram';
import EventEmitter from 'events';
import lib from './lib';


export const dateSelectEmitter = new EventEmitter();

const bot = new Telegraf(process.env.BOT_TOKEN);
export const calendar = new Calendar(bot);

calendar.setDateListener((context, date) => {
    dateSelectEmitter.emit(`dateSelect-${context.update.callback_query.from.id}`, date);
});

const stage = new Stage();

stage.register(lib.scenes.ticket);
stage.register(lib.scenes.language);

bot.use(session());
bot.use(stage.middleware());
bot.command('findtickets', lib.botHandler.findTickets);
bot.command('setlanguage', lib.botHandler.setLanguage);

bot.start(lib.botHandler.start);
bot.help(lib.botHandler.help);

bot.startPolling();
