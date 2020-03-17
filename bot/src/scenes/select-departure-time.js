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
    if(ctx.update.callback_query && /^\d{2}:00:00$/.test(ctx.update.callback_query.data)) {
      return ctx.wizard.next()
    }
    const buttonArr = []

    for (let i = 0; i < 23; i += 1) {
      const button = Markup.callbackButton(`${i<10 ? '0' : ''}${i}:00:00`, `${i<10 ? '0' : ''}${i}:00:00`)
  
      buttonArr.push(button)
    }

    // const command = ctx.update.callback_query && ctx.update.callback_query.data || false

    const leftElem = ctx.update.callback_query && ctx.update.callback_query.message.reply_markup.inline_keyboard[0][0].callback_data || false

    let timeButtons
    if (!leftElem) {
      timeButtons = [...buttonArr.splice(0,3), Markup.callbackButton('»', '»')]
    }

    const buttonList = Markup.inlineKeyboard(timeButtons).extra()

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
