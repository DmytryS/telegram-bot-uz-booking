import WizardScene from 'telegraf/scenes/wizard/index.js'
import Markup from 'telegraf/markup.js'
import Extra from 'telegraf/extra.js'
import UzClient from 'uz-booking-client'
import messages from '../assets/messages/index.js'
import logger from '../lib/logger.js'

const sendErrorMessage = (ctx, message) =>
  ctx.reply(`${messages[ctx.session.language].errorOccured}\n${message || ''}`)

const selectArrivalStation = new WizardScene(
  'selectArrivalStation',
  async ctx => {
    await ctx.reply(messages[ctx.session.language].enterArrivalStation)

    return ctx.wizard.next()
  },
  async ctx => {
    let stations = []

    try {
      const uzClient = new UzClient.ApiV1(ctx.session.language)
      const response = await uzClient.Station.find(ctx.message.text)

      stations = response.data
    } catch (err) {
      logger.error('An error occured during arrival station fetch', err)

      await sendErrorMessage(
        ctx,
        err.response && err.response.status === 503
          ? 'Service unavailable'
          : err.message
      )
      // ctx.reply(messages[ctx.session.language].enterArrivalStation);

      return ctx.scene.enter('initialScene')
    }

    if (stations.length === 0) {
      await ctx.reply(messages[ctx.session.language].stationNotExists)
      await ctx.reply(messages[ctx.session.language].enterArrivalStation)

      return
    }

    ctx.session.stations = stations

    await ctx.reply(
      messages[ctx.session.language].choseStation,
      Extra.markup(
        Markup.keyboard(stations.map(station => station.title))
          .oneTime()
          .resize()
      )
    )

    await ctx.wizard.next()
  },
  async ctx => {
    const arrivalStation = ctx.session.stations.find(
      station => station.title === ctx.message.text
    )

    if (!arrivalStation) {
      return ctx.reply(messages[ctx.session.language].choseStation)
    }

    ctx.session.arrivalStation = arrivalStation.value
    ctx.session.arrivalStationName = ctx.message.text

    delete ctx.session.stations

    await ctx.scene.enter('selectDepartureTime')
  }
)

export default selectArrivalStation
