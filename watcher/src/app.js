import 'dotenv/config';
import moment from 'moment';
import UzClient from 'uz-booking-client';
import _ from 'underscore';
import { logger, queue } from './services';
import { Job } from './models';

const watcherLogger = logger.getLogger('WatcherApp');

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
};

const intervalId = setInterval(() => {
  queue.connect().then(isConnected => {
    if (isConnected) {
      clearInterval(intervalId);
      watcherLogger.info('Watcher is up');
    }
  });
}, process.env.RABBIT_RECONNECT_INTERVAL);

const subscribeJobs = async () => {
  try {
    const subscribeEmmitter = await queue.subscribe(
      process.env.WORKER_QUEUE,
      'fanout'
    );

    subscribeEmmitter.on('data', async message => {
      const { jobId } = JSON.parse(message);
      const job = await Job.findById(jobId).populate('user');
      let notification = { jobId };

      if (job) {
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
          const trainsContainSeatType = trains.some(train =>
            train.types.some(seat =>
              job.ticketTypes.includes(
                _.invert(seatNames[job.user.language])[seat.title]
              )
            )
          );

          if (trainsContainSeatType) {
            notification.type = 'FOUND';

            await job.markAsSucceded();

            watcherLogger.info(`Found tickets for job with id ${jobId}`);

            await queue.publish(
              process.env.NOTIFICATIONS_QUEUE,
              'fanout',
              JSON.stringify(notification)
            );
          }
        }
      }
    });

    subscribeEmmitter.on('error', error => watcherLogger.error(error));
  } catch (error) {
    watcherLogger.error(error);
  }
};

subscribeJobs();
