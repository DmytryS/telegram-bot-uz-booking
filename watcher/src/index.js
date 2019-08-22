import 'dotenv/config.js'
import moment from 'moment'
import UzClient from 'uz-booking-client'
import { logger, amqp } from './lib/index.js'
import { Job } from './models/index.js'

const uzClient = new UzClient.ApiV2('en')
const { AMQP_NOTIFICATIONS_QUEUE, AMQP_WATCHER_QUEUE } = process.env
const placeTypes = {
  // en: {
  //   BERTH: 'Berth / 3-cl. sleeper',
  //   DE_LUXE: 'De Luxe / 1-cl. sleeper',
  //   COMPARTMENT: 'Compartment / 2-cl. sleeper',
  //   SEATING_1ST_CLASS: 'Seating first class',
  //   SEATING_2ND_CLASS: 'Seating second class',
  //   SEATING_3D_CLASS: 'Seating third class'
  // },
  // uk: {
  //   BERTH: 'Плацкарт',
  //   DE_LUXE: 'Люкс',
  //   COMPARTMENT: 'Купе',
  //   SEATING_1ST_CLASS: 'Сидячий першого класу',
  //   SEATING_2ND_CLASS: 'Сидячий другого класу',
  //   SEATING_3D_CLASS: 'Сидячий третього класу'
  // },
  // ru: {
  //   BERTH: 'Плацкарт',
  //   DE_LUXE: 'Люкс',
  //   COMPARTMENT: 'Купе',
  //   SEATING_1ST_CLASS: 'Сидячий первого класса',
  //   SEATING_2ND_CLASS: 'Сидячий второго класса',
  //   SEATING_3D_CLASS: 'Сидячий третьего класса'
  // }
  'К': 'COMPARTMENT',
  'Л': 'DE_LUXE',
  'П': 'BERTH',
  'С-1': 'SEATING_1ST_CLASS',
  'С-2': 'SEATING_2ND_CLASS',
  'С-3': 'SEATING_3D_CLASS',
}

const getPlaceType = (wagonType) => placeTypes[`${wagonType.type}${wagonType.class ? '-' + wagonType.class : ''}`]

const findTicket = async (message) => {
  logger.info(`Received message: ${message}`)

  const { jobId } = JSON.parse(message)
  const job = await Job.findById(jobId).populate('user')
  const output = { jobId }

  if (job) {
    try {
      const response = await uzClient.Train.find(
        job.departureStationId,
        job.arrivalStationId,
        moment(job.departureDate).format('YYYY-MM-DD'),
        '00:00:00'
      )

      if (!response || response.data.data || !response.data.data.trains) {
        throw new Error(JSON.stringify(response.data.data))
      }

      const trains = response.data.data.trains.filter(
        train => train.wagon_types.length > 0
      )

      if (trains.length > 0) {
        const trainContainsSeatType = trains.some(train =>
          train.wagon_types.some(seat =>
            job.ticketTypes.includes(
              getPlaceType(seat)
            )
          )
        )

        if (trainContainsSeatType) {
          output.type = 'FOUND'

          await job.markAsSucceded()

          logger.info(`Found tickets for job with id ${jobId}`)

          await amqp.publish(
            AMQP_NOTIFICATIONS_QUEUE,
            JSON.stringify(output)
          )
        }
      }
    } catch (error) {
      logger.error(error)
    }
  }
}

amqp.listen(AMQP_WATCHER_QUEUE, findTicket)
