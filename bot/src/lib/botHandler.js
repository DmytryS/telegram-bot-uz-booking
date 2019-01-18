import messages from './messages';
import { User } from '../models';
import { Extra, Markup } from 'telegraf';

const start = async (ctx) => {
    await User.updateOne({
        telegramId: ctx.update.message.from.id
    },
    {
        telegramId: ctx.update.message.from.id,
        firstName: ctx.update.message.from.first_name,
        lastName: ctx.update.message.from.last_name,
        userName: ctx.update.message.from.username
    },
    {
        upsert: true,
        setDefaultsOnInsert: true
    });
    
    ctx.reply(
        `Чем могу помочь, ${ctx.from.first_name}?`,
        Markup.inlineKeyboard([
            Markup.callbackButton('🎫 Найти билеты', 'FIND_DIRECT_TICKETS'),
            Markup.callbackButton('🏳️ Установить язык', 'SET_LANGUAGE')
        ]).extra()
    );

    // ctx.scene.enter('setlanguage');
};

const help = (ctx) => ctx.reply(messages.en.help);

const setLanguage = (ctx) => ctx.scene.enter('setlanguage');

const findDirectTickets = (ctx) => ctx.scene.enter('finddirecttickets');

export default {
    start,
    help,
    setLanguage,
    findDirectTickets
};
