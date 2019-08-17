import UzClient from 'uz-booking-client';
import moment from 'moment';
import { queue, logger } from '../services/index.js';
import { Job } from '../models/index.js';
import messages from './messages/index.js';
import { print } from '../utils/index.js';

export default class JobsHandler {
  constructor(bot) {
    // logger = logger.getLogger('JobHandler');
    this.bot = bot;
  }

  async subscribeToQueue(queueName) {
    try {
      await queue.start();

      const subscribeEmmitter = await queue.subscribe(queueName, 'fanout');

      subscribeEmmitter.on('data', async data => {
        try {
          logger.info('Received message:', data);
          let { jobId, type } = JSON.parse(data);

          const job = await Job.findById(jobId).populate('user');
          const uzClient = new UzClient.ApiV2(job.user.language);

          let message = false;
          let response;
          let trains;

          switch (type) {
            case 'FAILED':
            case 'EXPIRATION':
              message = messages[job.user.language].watcherDidnotFoundTicket;
              break;
            case 'FOUND':
              response = await uzClient.Train.find(
                job.departureStationId,
                job.arrivalStationId,
                moment(job.departureDate).format('YYYY-MM-DD'),
                '00:00:00'
              );

              if (
                !response ||
                (response.data.data && !response.data.data.trains)
              ) {
                throw new Error(JSON.stringify(response.data.data));
              }

              trains = response.data.data.trains.filter(
                train => train.wagon_types.length > 0
              );

              if (trains.length > 0) {
                message = messages[job.user.language].watcherFoundTicket + '\n';
                message += print.printTrainsList(
                  trains,
                  moment(job.departureDate).format('YYYY-MM-DD'),
                  job.user.language
                );
              }
              break;
            default:
              logger.error(`Unexpected data ${data}`);
              break;
          }

          if (message) {
            this.bot.telegram.sendMessage(job.chatId, message);
          }
        } catch (error) {
          logger.error(error);
        }
      });

      subscribeEmmitter.on('error', error => logger.error(error));
    } catch (error) {
      logger.error(error);
    }
  }
}
