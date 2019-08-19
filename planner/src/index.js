import 'dotenv/config.js'
import moment from 'moment-timezone'
import { logger, amqp } from './lib/index.js'
import Job from './models/job.js'

const findActiveJobs = async () => {
  try {

    // await amqp.publish(
    //   notification.type === 'EXPIRATION'
    //     ? process.env.NOTIFICATIONS_QUEUE
    //     : process.env.WORKER_QUEUE,
    //   'fanout',
    //   JSON.stringify(notification)
    // )
    // amqp.listen(process.env.NOTIFICATIONS_QUEUE, () => { })


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
    }
  } catch (error) {
    logger.error(error)
  }
}

// amqp.start().then(async () => {
//   logger.info('Planner is up')
//   await findActiveJobs()

//   await amqp.stop()
// })

// amqp.listen()
findActiveJobs()
