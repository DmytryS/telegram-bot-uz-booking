import 'dotenv/config';
import UzClient from 'uz-booking-client';
import { logger, queue } from './services';
import { Job } from './models';

const subscribeJobs = async () => {
  try {
    const subscribeEmmitter = await queue.subscribe(
      process.env.WORKER_QUEUE,
      'fanout'
    );

    subscribeEmmitter.on('data', async message => {
      let notification = {};
      const { jobId } = JSON.parse(message);
      const job = await Job.findById(jobId).populate('user');

      if (job) {
        const uzClient = new UzClient(job.user.language);

        const response = await uzClient.Train.find(
          job.departureStationId,
          job.arrivalStationId,
          job.departureDate,
          '00:00'
        );

        if (!response || (response.data.data && !response.data.data.list)) {
          throw new Error(response.data.data);
        }

        const trains = response.data.data.list.filter(
          train => train.types.length > 0
        );

        if (trains.length > 0) {
          await queue.produce(
            process.env.NOTIFICATIONS_QUEUE,
            JSON.stringify(notification),
            true,
            true
          );
        }
      }
    });

    subscribeEmmitter.on('error', error => logger.error(error));

    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

subscribeJobs();
