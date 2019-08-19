import 'dotenv/config.js'
import moment from 'moment'
import UzClient from 'uz-booking-client'
import _ from 'underscore'
import { logger, amqp } from './lib/index.js'
import Job from './models/job.js'

const seatNames = {
  en: {
    BERTH: 'Berth / 3-cl. sleeper',
    DE_LUXE: 'De Luxe / 1-cl. sleeper',
    COMPARTMENT: 'Compartment / 2-cl. sleeper',
    SEATING_1ST_CLASS: 'Seating first class',
    SEATING_2ND_CLASS: 'Seating second class',
    SEATING_3D_CLASS: 'Seating third class'
  },
  uk: {
    BERTH: 'Плацкарт',
    DE_LUXE: 'Люкс',
    COMPARTMENT: 'Купе',
    SEATING_1ST_CLASS: 'Сидячий першого класу',
    SEATING_2ND_CLASS: 'Сидячий другого класу',
    SEATING_3D_CLASS: 'Сидячий третього класу'
  },
  ru: {
    BERTH: 'Плацкарт',
    DE_LUXE: 'Люкс',
    COMPARTMENT: 'Купе',
    SEATING_1ST_CLASS: 'Сидячий первого класса',
    SEATING_2ND_CLASS: 'Сидячий второго класса',
    SEATING_3D_CLASS: 'Сидячий третьего класса'
  }
}

const findTicket = async (message) => {
  logger.info('Received message:', message)

  const { jobId } = JSON.parse(message)
  const job = await Job.findById(jobId).populate('user')
  let notification = { jobId }

  if (job) {
    try {
      const uzClient = new UzClient(job.user.language || 'en')

      const response = await uzClient.Train.find(
        job.departureStationId,
        job.arrivalStationId,
        moment(job.departureDate).format('YYYY-MM-DD'),
        '00:00'
      )

      if (!response || (response.data.data && !response.data.data.list)) {
        throw new Error(JSON.stringify(response.data.data))
      }

      const trains = response.data.data.list.filter(
        train => train.types.length > 0
      )

      if (trains.length > 0) {
        const trainsContainSeatType = trains.some(train =>
          train.types.some(seat =>
            job.ticketTypes.includes(
              _.invert(seatNames[job.user.language || 'en'])[seat.title]
            )
          )
        )

        if (trainsContainSeatType) {
          notification.type = 'FOUND'

          await job.markAsSucceded()

          logger.info(`Found tickets for job with id ${jobId}`)

          await amqp.send(
            process.env.NOTIFICATIONS_QUEUE,
            JSON.stringify(notification)
          )
        }
      }
    } catch (error) {
      logger.error(error)
    }
  }
}

amqp.listen(process.env.WORKER_QUEUE, findTicket)
