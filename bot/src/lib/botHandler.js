import messages from './messages';
import { User } from '../models';
import { Markup } from 'telegraf';

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

    ctx.session.language = ctx.session.language || 'en';

    ctx.reply(
        messages[ ctx.session.language ].greetingMessage(ctx.from.first_name),
        Markup.inlineKeyboard([
            Markup.callbackButton(messages[ ctx.session.language ].findTickets, 'FIND_DIRECT_TICKETS'),
            Markup.callbackButton(messages[ ctx.session.language ].setLanguage, 'SET_LANGUAGE')
        ]).extra()
    );

    // ctx.scene.enter('setlanguage');
};

const help = (ctx) => ctx.reply(messages.en.help);

const setLanguage = (ctx) => ctx.scene.enter('setlanguage');

const findDirectTickets = (ctx) => {
    ctx.session.ticketSearchType = 'DIRECT';
    ctx.scene.enter('selectDepartureStation');
};

const findInterchangeTickets = (ctx) => {
    ctx.session.ticketSearchType = 'INTERCHANGE';
    ctx.scene.enter('selectDepartureStation');
}

export default {
    start,
    help,
    setLanguage,
    findDirectTickets,
    findInterchangeTickets
};
