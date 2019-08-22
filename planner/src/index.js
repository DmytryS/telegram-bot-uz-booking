import 'dotenv/config.js'
import moment from 'moment-timezone'
import { logger, amqp, mongo } from './lib/index.js'
import Job from './models/job.js'

const { AMQP_NOTIFICATIONS_QUEUE, AMQP_WATCHER_QUEUE } = process.env

const findActiveJobs = async () => {
  try {
    const jobs = await Job.find({
      status: 'ACTIVE'
    })

    // eslint-disable-next-line
    for (let job of jobs) {
      const output = {
        jobId: job._id.toString()
      }

      if (
        moment(job.departureDate, 'YYYY-MM-DD')
          .tz('Europe/Kiev')
          .add(1, 'day')
          .set('hours', 0)
          .diff(moment().tz('Europe/Kiev'), 'hours', true) < 3
      ) {
        // eslint-disable-next-line
        await job.markAsExpired();
        output.type = 'EXPIRATION'

        logger.info(`Job with id ${job._id.toString()} expired`)
      }

      // eslint-disable-next-line
      await amqp.publish(
        output.type === 'EXPIRATION' ? AMQP_NOTIFICATIONS_QUEUE : AMQP_WATCHER_QUEUE,
        JSON.stringify(output)
      )
    }

    await amqp.close()
    await mongo.connection.close()
  } catch (error) {
    logger.error(error)
    logger.warn('Shutdown after error')

    await amqp.close()
    await mongo.connection.close()
  }
}

findActiveJobs()
