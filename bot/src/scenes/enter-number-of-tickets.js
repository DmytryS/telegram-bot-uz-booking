import WizardScene from 'telegraf/scenes/wizard/index.js'
import Markup from 'telegraf/markup.js'
import { User, Job } from '../models/index.js'
import messages from '../assets/messages/index.js'

const sendErrorMessage = (ctx, message) =>
  ctx.reply(`${messages[ctx.session.language].errorOccured}\n${message || ''}`)

const enterNumberOfTickets = new WizardScene(
  'enterNumberOfTickets',
  ctx => {
    const buttonArr = []

    for (let i = 1; i < 5; i += 1) {
      const button = [Markup.callbackButton(i, i.toString())]

      buttonArr.push(button)
    }

    const buttonList = Markup.inlineKeyboard(buttonArr).extra()

    ctx.reply(messages[ctx.session.language].howManyTicketsYouNeed, buttonList)

    return ctx.wizard.next()
  },
  async ctx => {
    const amountOfTickets = parseInt(ctx.callbackQuery.data, 10)

    if (!amountOfTickets) {
      sendErrorMessage(ctx)
      // ctx.reply(messages[ctx.session.language].howManyTicketsYouNeed);
      ctx.back()
    }

    const user = await User.findOne({ telegramId: ctx.from.id })

    const existingJob = await Job.findOne({
      chatId: ctx.from.id,
      user: user._id,
      departureStationId: ctx.session.departureStation,
      arrivalStationId: ctx.session.arrivalStation,
      departureDate: ctx.session.departureDate,
      // amountOfTickets,
      ticketTypes: ctx.session.ticketTypes,
      status: 'ACTIVE',
    })

    if (existingJob) {
      ctx.reply(messages[ctx.session.language].alreadyWatching)
    } else {
      await new Job({
        chatId: ctx.from.id,
        user: user._id,
        departureStationId: ctx.session.departureStation,
        departureStationName: ctx.session.departureStationName,
        arrivalStationId: ctx.session.arrivalStation,
        arrivalStationName: ctx.session.arrivalStationName,
        departureDate: ctx.session.departureDate,
        amountOfTickets,
        ticketTypes: ctx.session.ticketTypes,
      }).save()

      ctx.reply(messages[ctx.session.language].sayWhenAvailable)
    }

    ctx.session.ticketTypes = []

    ctx.scene.enter('initialScene')
  }
)

export default enterNumberOfTickets
