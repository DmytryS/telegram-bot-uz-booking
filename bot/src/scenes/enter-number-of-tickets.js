import WizardScene from 'telegraf/scenes/wizard/index.js'
import Markup from 'telegraf/markup.js'
import { User, Job } from '../models/index.js'
import messages from '../assets/messages/index.js'

// const sendErrorMessage = (ctx, message) =>
//   ctx.reply(`${messages[ctx.session.language].errorOccured}\n${message || ''}`)

const enterNumberOfTickets = new WizardScene(
  'enterNumberOfTickets',
  async ctx => {
    const buttonArr = []

    for (let i = 1; i < 5; i += 1) {
      const button = [Markup.callbackButton(i, i.toString())]

      buttonArr.push(button)
    }

    const buttonList = Markup.inlineKeyboard(buttonArr).extra()

    const amountOfTickets = ctx.callbackQuery && ctx.callbackQuery.data ? parseInt(ctx.callbackQuery.data, 10) : false

    if (!amountOfTickets) {
      await ctx.reply(
        messages[ctx.session.language].howManyTicketsYouNeed,
        buttonList
      )
    } else {
      buttonArr[amountOfTickets - 1][0].text = `${buttonArr[amountOfTickets - 1][0].text} ✅`
      await ctx.editMessageText(
        messages[ctx.session.language].howManyTicketsYouNeed,
        buttonList
      )

      const user = await User.findOne({ telegramId: ctx.from.id })

      const existingJob = await Job.findOne({
        chatId: ctx.from.id,
        user: user._id,
        departureStationId: ctx.session.departureStation,
        arrivalStationId: ctx.session.arrivalStation,
        departureDate: ctx.session.departureDate,
        departureTime: ctx.session.departureTime,
        // amountOfTickets,
        ticketTypes: ctx.session.ticketTypes,
        status: 'ACTIVE',
      })
  
      if (existingJob) {
        await ctx.reply(messages[ctx.session.language].alreadyWatching)
      } else {
        await new Job({
          chatId: ctx.from.id,
          user: user._id,
          departureStationId: ctx.session.departureStation,
          departureStationName: ctx.session.departureStationName,
          arrivalStationId: ctx.session.arrivalStation,
          arrivalStationName: ctx.session.arrivalStationName,
          departureDate: ctx.session.departureDate,
          departureTime: ctx.session.departureTime,
          amountOfTickets,
          ticketTypes: ctx.session.ticketTypes,
        }).save()
  
        await ctx.reply(messages[ctx.session.language].sayWhenAvailable)
      }
  
      ctx.session.ticketTypes = []
      delete ctx.session.amountOfTickets
  
      await ctx.scene.enter('initialScene')
    }
  },
)

export default enterNumberOfTickets
