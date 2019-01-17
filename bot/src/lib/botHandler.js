import messages from './messages';
import { user } from '../models';

const start = async (ctx) => {
    // const user = await dbClient.send({
    //     type: 'create-user',
    //     user: {
    //         telegramId: ctx.update.message.from.id,
    //         firstName: ctx.update.message.from.first_name,
    //         lastName: ctx.update.message.from.last_name,
    //         userName: ctx.update.message.from.username
    //     }
    // });

    // console.log(user);


    // ctx.scene.enter('setlanguage');
    await user.create({
        telegramId: ctx.update.message.from.id,
        firstName: ctx.update.message.from.first_name,
        lastName: ctx.update.message.from.last_name,
        userName: ctx.update.message.from.username
    });
    console.log('Start');

};

const help = (ctx) => ctx.reply(messages.en.help);

const setLanguage = (ctx) => ctx.scene.enter('setlanguage');

const findTickets = (ctx) => ctx.scene.enter('findtickets');

export default {
    start,
    help,
    setLanguage,
    findTickets
};
