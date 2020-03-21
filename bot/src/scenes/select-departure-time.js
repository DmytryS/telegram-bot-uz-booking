import WizardScene from 'telegraf/scenes/wizard/index.js'
import Markup from 'telegraf/markup.js'
import messages from '../assets/messages/index.js'

const selectDepartureDate = new WizardScene(
  'selectDepartureTime',
  async ctx => {
    const buttonArr = []

    for (let i = 0; i < 24; i += 1) {
      const button = Markup.callbackButton(`${i<10 ? '0' : ''}${i}:00:00`, `${i<10 ? '0' : ''}${i}:00:00`)
  
      buttonArr.push(button)
    }

    if(ctx.update.callback_query && /^\d{2}:00:00$/.test(ctx.update.callback_query.data)) {
      ctx.session.departureTime = ctx.callbackQuery.data
      
      const buttons = ctx.update.callback_query.message.reply_markup.inline_keyboard[0]
        .map(button => Markup.callbackButton(ctx.session.departureTime === button.text ? `${button.text} ✅` : button.text, button.callback_data))

      await ctx.editMessageText(
        messages[ctx.session.language].chooseDepartureTime,
        Markup.inlineKeyboard(buttons).extra()
      )
      return ctx.scene.enter('selectDepartureDate')
    }

    const command = ctx.update.callback_query && ctx.update.callback_query.data !== 'FIND_ANOTHER_DATE_TICKETS' && ctx.update.callback_query.data || false
    let timeButtons

    if (!command) {
      timeButtons = [...buttonArr.splice(0,4), Markup.callbackButton('»', '»')]
    } else {
      if (command === '«') {
        const isLastPage = ctx.update.callback_query.message.reply_markup.inline_keyboard[0][0].callback_data !== '«'

        if (isLastPage) {
          timeButtons = [...buttonArr.splice(0,4),  Markup.callbackButton('»', '»')]
        } else {
          const leftElement = ctx.update.callback_query && ctx.update.callback_query.message.reply_markup.inline_keyboard[0][1].callback_data
          const leftElementIndex = buttonArr.findIndex(b => b.text === leftElement)

          const isLast = buttonArr[leftElementIndex - 4].text === '00:00:00'
          timeButtons = [...isLast ? [] : [Markup.callbackButton('«', '«')], ...buttonArr.splice(leftElementIndex - 4,4), Markup.callbackButton('»', '»')]
        }

      } else {
        if (command === '»') {
          const isLastPage = ctx.update.callback_query.message.reply_markup.inline_keyboard[0].slice(-1)[0].callback_data !== '»'

          if (isLastPage) {
            timeButtons = [Markup.callbackButton('«', '«'), ...buttonArr.splice(-4,4)]
          } else {
            const rightElement = ctx.update.callback_query && ctx.update.callback_query.message.reply_markup.inline_keyboard[0].slice(-2)[0].callback_data
            const rightElementIndex = buttonArr.findIndex(b => b.text === rightElement)
            const isLast = buttonArr[rightElementIndex + 4].text === '23:00:00'

            timeButtons = [Markup.callbackButton('«', '«'), ...buttonArr.splice(rightElementIndex + 1,4), ...isLast ? [] : [Markup.callbackButton('»', '»')] ]
          }
        }
      } 
    }

    const buttonList = Markup.inlineKeyboard(timeButtons).extra()

    if (ctx.callbackQuery && (ctx.callbackQuery.data === '«' || ctx.callbackQuery.data === '»')) {
      await ctx.editMessageText(messages[ctx.session.language].chooseDepartureTime, buttonList)
    } else {
      await ctx.reply(messages[ctx.session.language].chooseDepartureTime, buttonList)
    }
  },
)

export default selectDepartureDate
