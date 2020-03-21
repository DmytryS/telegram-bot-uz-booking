import WizardScene from 'telegraf/scenes/wizard/index.js'
import Markup from 'telegraf/markup.js'
import messages from '../assets/messages/index.js'

const initialScene = new WizardScene(
  'initialScene',
  async ctx => {
    await ctx.reply(
      messages[ctx.session.language].letsTryAgain,
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

    await ctx.scene.leave()
  })

export default initialScene
