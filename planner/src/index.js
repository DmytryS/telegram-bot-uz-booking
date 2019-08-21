import 'dotenv/config.js'
import moment from 'moment-timezone'
import { logger, amqp, mongo } from './lib/index.js'
import Job from './models/job.js'

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
      }

      // eslint-disable-next-line
      await amqp.send(
        output.type === 'EXPIRATION'
          ? process.env.NOTIFICATIONS_QUEUE
          : process.env.WORKER_QUEUE,
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
