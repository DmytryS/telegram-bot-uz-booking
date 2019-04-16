import 'dotenv/config';
import moment from 'moment-timezone';
import { logger, queue } from './services';
import { Job } from './models';

const plannerLogger = logger.getLogger('PlanerApp');

const pushToQueue = async () => {
  try {
    const jobs = await Job.find({
      status: 'ACTIVE'
    });

    // eslint-disable-next-line
    for (let job of jobs) {
      const notification = {
        jobId: job._id.toString()
      };

      if (
        moment(job.departureDate, 'YYYY-MM-DD')
          .tz('Europe/Kiev')
          .add(1, 'day')
          .set('hours', 0)
          .diff(moment().tz('Europe/Kiev'), 'hours', true) < 3
      ) {
        // eslint-disable-next-line
        await job.markAsExpired();

        notification.type = 'EXPIRATION';
      }

      // eslint-disable-next-line
      await queue.publish(
        notification.type === 'EXPIRATION'
          ? process.env.NOTIFICATIONS_QUEUE
          : process.env.WORKER_QUEUE,
        'fanout',
        JSON.stringify(notification)
      );
    }
  } catch (error) {
    plannerLogger.error(error);
  }
};

const intervalId = setInterval(() => {
  queue.start().then(isConnected => {
    if (isConnected) {
      clearInterval(intervalId);
      plannerLogger.info('Planner is up');
    }
  });
}, process.env.RABBIT_RECONNECT_INTERVAL);

setInterval(pushToQueue, process.env.JOBS_CHECK_INTERVAL);
