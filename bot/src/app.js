import {} from 'dotenv/config';
import Telegraf, { session } from 'telegraf';
import Stage from 'telegraf/stage';
import Calendar from 'telegraf-calendar-telegram';
import EventEmitter from 'events';
import { botHandler, scenes } from './lib';

const bot = new Telegraf(process.env.BOT_TOKEN);

export const dateSelectEmitter = new EventEmitter();
export const calendar = new Calendar(bot);

calendar.setDateListener((context, date) => {
    dateSelectEmitter.emit(`dateSelect-${context.update.callback_query.from.id}`, date);
});

const stage = new Stage();

stage.register(scenes.ticket);
stage.register(scenes.language);

bot.use(session());
bot.use(stage.middleware());
bot.command('findtickets', botHandler.findTickets);
bot.command('setlanguage', botHandler.setLanguage);

bot.start(botHandler.start);
bot.help(botHandler.help);

bot.startPolling();
