import 'dotenv/config.js'
import Telegraf from 'telegraf'
import Stage from 'telegraf/stage.js'
import telegrafSession from 'telegraf/session.js'
import Calendar from 'telegraf-calendar-telegram'
import EventEmitter from 'events'
import { middlewares, jobHandler, logger, amqp } from './lib/index.js'
import * as scenes from './scenes/index.js'
import * as commands from './commands/index.js'

// const appLogger = logger.getLogger('BotApp');
const bot = new Telegraf(process.env.BOT_TOKEN)

export const dateSelectEmitter = new EventEmitter()
export const calendar = new Calendar(bot)

amqp.listen(process.env.NOTIFICATIONS_QUEUE, jobHandler(bot))

calendar.setDateListener((context, date) => {
  dateSelectEmitter.emit(
    `dateSelect-${context.update.callback_query.from.id}`,
    date
  )
})

const stage = new Stage(
  [
    scenes.initialScene,
    scenes.selectDepartureStation,
    scenes.selectArrivalStation,
    scenes.selectDepartureDate,
    scenes.setLanguage,
    scenes.selectSeatType,
    scenes.enterNumberOfTickets,
  ],
  { ttl: 60 }
)

bot.use(telegrafSession())
bot.use(stage.middleware())
bot.use(middlewares.getUserLanguage)

bot.command('finddirecttickets', commands.findDirectTickets)
bot.command('findinterchangetickets', commands.findInterchangeTickets)
bot.command('setlanguage', commands.setLanguage)
bot.command('getwatchers', commands.getWatchers)
bot.command('stop', commands.stop)
bot.command('help', commands.help)

bot.action('FIND_DIRECT_TICKETS', commands.findDirectTickets)
bot.action('SET_LANGUAGE', commands.setLanguage)
bot.action('GET_WATCHERS', commands.getWatchers)
bot.action('HELP', commands.help)

bot.hears(/\/stop_watch_(.*)/, commands.stopWatch)

bot.start(commands.start)
bot.help(commands.help)
bot.catch(err => {
  logger.error(`An error occured in app ${JSON.stringify(err)}`)
})
bot.startPolling()
