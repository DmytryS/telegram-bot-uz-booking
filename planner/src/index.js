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
      const notification = {
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

        notification.type = 'EXPIRATION'
      }

      // eslint-disable-next-line
      await amqp.send(
        notification.type === 'EXPIRATION'
          ? process.env.NOTIFICATIONS_QUEUE
          : process.env.WORKER_QUEUE,
        JSON.stringify(notification)
      )

      await amqp.disconnect()
      await mongo.connection.close()
    }
  } catch (error) {
    logger.error(error)

    await amqp.disconnect()
    await mongo.connection.close()
  }
}

// amqp.start().then(async () => {
//   logger.info('Planner is up')
//   await findActiveJobs()

//   await amqp.stop()
// })

// amqp.listen()
findActiveJobs()
