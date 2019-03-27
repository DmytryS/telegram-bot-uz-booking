import UzClient from 'uz-booking-client';
import moment from 'moment';
import { queue, logger } from '../services';
import { Job } from '../models';
import messages from './messages';
import { print } from '../utils';

export default class JobsHandler {
  constructor(bot) {
    this.logger = logger.getLogger('JobHandler');
    this.bot = bot;
  }

  async subscribeToQueue(queueName) {
    try {
      await queue.connect();

      const subscribeEmmitter = await queue.subscribe(queueName, 'fanout');

      subscribeEmmitter.on('data', async data => {
        this.logger.info(`RECEIVED DATA`, data);
        let { jobId, type } = JSON.parse(data);

        const job = await Job.findById(jobId).populate('user');
        const uzClient = new UzClient(job.user.language);

        let message = false;
        let response;
        let trains;

        switch (type) {
          case 'EXPIRATION':
            message = messages[job.user.language].watcherDidnotFoundTicket;
            break;
          case 'FOUND':
            response = await uzClient.Train.find(
              job.departureStationId,
              job.arrivalStationId,
              moment(job.departureDate).format('YYYY-MM-DD'),
              '00:00'
            );

            if (!response || (response.data.data && !response.data.data.list)) {
              throw new Error(response.data.data);
            }

            trains = response.data.data.list.filter(
              train => train.types.length > 0
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
            this.logger.error(`Unexpected message ${message}`);
            break;
        }

        if (message) {
          this.bot.telegram.sendMessage(job.chatId, message);
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
