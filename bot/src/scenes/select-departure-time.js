import WizardScene from 'telegraf/scenes/wizard/index.js'
import Markup from 'telegraf/markup.js'
import logger from '../lib/logger.js'
import messages from '../assets/messages/index.js'
import { timeSelectEmitter } from '../index.js'

const sendErrorMessage = (ctx, message) =>
  ctx.reply(`${messages[ctx.session.language].errorOccured}\n${message || ''}`)

const selectDepartureDate = new WizardScene(
  'selectDepartureTime',
  ctx => {
    const buttonArr = []

    for (let i = 0; i < 23; i += 1) {
      const button = Markup.callbackButton(`${i<10 ? '0' : ''}${i}:00:00`, `${i<10 ? '0' : ''}${i}:00:00`)
  
      buttonArr.push(button)
    }

    const buttonList = Markup.inlineKeyboard(buttonArr).extra()
    ctx.reply(messages[ctx.session.language].chooseDepartureTime, buttonList)

    const onTimeSelected = () => {

      return ctx.wizard.next()
    }

    const userId =
      (ctx.update.message && ctx.update.message.from.id) ||
      (ctx.update.callback_query && ctx.update.callback_query.from.id)

    timeSelectEmitter.once(`timeSelect-${userId}`, onTimeSelected)
  },
  ctx => {
    try{
      if (!ctx || !ctx.callbackQuery || !ctx.callbackQuery.data) {
        sendErrorMessage(ctx)
        ctx.back()
      }

      ctx.session.departureTime = ctx.callbackQuery.data
      ctx.scene.enter('selectDepartureDate')
    } catch(err) {
      logger.error(err)
      sendErrorMessage(
        ctx,
        err.message
      )
      ctx.scene.leave()
    }
  }
)

export default selectDepartureDate
