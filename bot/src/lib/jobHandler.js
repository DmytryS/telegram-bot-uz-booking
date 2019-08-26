import UzClient from 'uz-booking-client'
import moment from 'moment'
import logger from '../lib/logger.js'
import Job from '../models/job.js'
import messages from '../assets/messages/index.js'
import { print } from '../utils/index.js'
import { inspect } from 'util'

export default function (bot) {
  return async message => {
    try {
      logger.info(`[JobHandler] Received message: ${inspect(message, { colors: true, depth: 4 })}`)
      let { jobId, type } = message

      const job = await Job.findById(jobId).populate('user')
      const uzClient = new UzClient.ApiV2(job.user.language)

      let botMessage = false
      let response
      let trains

      switch (type) {
        case 'FAILED':
        case 'EXPIRATION':
          botMessage = messages[job.user.language].watcherDidnotFoundTicket
          break
        case 'FOUND':
          response = await uzClient.Train.find(
            job.departureStationId,
            job.arrivalStationId,
            moment(job.departureDate).format('YYYY-MM-DD'),
            '00:00:00'
          )

          if (
            !response ||
            (response.data.data && !response.data.data.trains)
          ) {
            throw new Error(JSON.stringify(response.data.data))
          }

          trains = response.data.data.trains.filter(
            train => train.wagon_types.length > 0
          )

          if (trains.length > 0) {
            botMessage = messages[job.user.language].watcherFoundTicket + '\n'
            botMessage += print.printTrainsList(
              trains,
              moment(job.departureDate).format('YYYY-MM-DD'),
              job.user.language
            )
          }
          break
        default:
          logger.error(`[JobHandler] Unexpected data ${inspect(message, { colors: true, depth: 4 })}`)
          break
      }

      if (botMessage) {
        bot.telegram.sendMessage(job.chatId, botMessage)
      }
    } catch (error) {
      logger.error(`[JobHandler] Error:${inspect(error, { colors: true, depth: 4 })}`)
    }
  }
}
