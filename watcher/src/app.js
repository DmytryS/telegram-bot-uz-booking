import 'dotenv/config';
import UzClient from 'uz-booking-client';
import moment from 'moment';
import { logger, queue } from './services';
import { Job } from './models';

class App {
  constructor() {
    this.logger = logger.getLogger('App');
  }

  // eslint-disable-next-line
  async init() {
    await queue.connect();
  }

  async subscribeJobs() {
    try {
      const subscribeEmmitter = await queue.subscribe(
        process.env.WORKER_QUEUE,
        'fanout'
      );

      subscribeEmmitter.on('data', async message => {
        this.logger.info(`RECEIVED DATA`, message);
        const { jobId } = JSON.parse(message);
        const job = await Job.findById(jobId).populate('user');
        let notification = { jobId };

        if (job && job.isActive()) {
          if (
            moment().diff(
              moment(job.departureDate, 'YYYY-MM-DD'),
              'hours',
              true
            ) < 3
          ) {
            await job.markAsExpired();

            notification.type = 'EXPIRATION';
          } else {
            const uzClient = new UzClient(job.user.language);

            const response = await uzClient.Train.find(
              job.departureStationId,
              job.arrivalStationId,
              moment(job.departureDate).format('YYYY-MM-DD'),
              '00:00'
            );

            if (!response || (response.data.data && !response.data.data.list)) {
              throw new Error(response.data.data);
            }

            const trains = response.data.data.list.filter(
              train => train.types.length > 0
            );

            if (trains.length > 0) {
              notification.type = 'FOUND';
            }
          }

          await queue.produce(
            process.env.NOTIFICATIONS_QUEUE,
            JSON.stringify(notification),
            true,
            true
          );
        }
      });

      subscribeEmmitter.on('error', error => this.logger.error(error));

      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}

async function main() {
  const app = new App();
  await app.init();
  app.subscribeJobs();
}

main();
