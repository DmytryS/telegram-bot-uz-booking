import Markup from 'telegraf/markup.js'
import messages from '../assets/messages/index.js'
import User from '../models/user.js'

const start = async ctx => {
  await User.updateOne(
    {
      telegramId: ctx.update.message.from.id,
    },
    {
      telegramId: ctx.update.message.from.id,
      firstName: ctx.update.message.from.first_name,
      lastName: ctx.update.message.from.last_name,
      userName: ctx.update.message.from.username,
      botEnabled: true,
    },
    {
      upsert: true,
      setDefaultsOnInsert: true,
    }
  )

  ctx.session.language = ctx.session.language || 'en'

  ctx.reply(
    messages[ctx.session.language].greetingMessage(ctx.from.first_name),
    Markup.inlineKeyboard([
      Markup.callbackButton(
        messages[ctx.session.language].findTickets,
        'FIND_DIRECT_TICKETS'
      ),
      Markup.callbackButton(
        messages[ctx.session.language].setLanguage,
        'SET_LANGUAGE'
      ),
      Markup.callbackButton(messages[ctx.session.language].help, 'HELP'),
    ]).extra()
  )

  // ctx.scene.enter('setlanguage');
}

export default start
