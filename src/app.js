import Client from 'uz-booking-client';
import moment from 'moment';
import Telegraf from 'telegraf';

import config from '../config/config';

export default class App {
    constructor() {
        this._bot = new Telegraf(config.telegram.token);

        this._bot.start((ctx) => ctx.reply('Welcome!'));
        this._bot.help((ctx) => ctx.reply('Send me a sticker'));
        this._bot.on('sticker', (ctx) => ctx.reply('👍'));
        this._bot.hears('hi', (ctx) => ctx.reply('Hey there'));
        this._bot.command('search', async ({ reply }) => {
        
            const uzClient = new Client('ru');
            const ticketsDate = moment().add(10, 'days');

            const departureStations = await uzClient.Station.find('Kyiv');
            const departureStation = departureStations.data[ 0 ];
         
            const targetStations = await uzClient.Station.find('Lviv');
            const targetStation = targetStations.data[ 0 ];
         
            const trains = await uzClient.Train.find(
                departureStation,
                targetStation,
                ticketsDate.format('YYYY-MM-DD'),
                '00:00'
            );
         
            const train = trains.data.data.list[ 3 ];
           
            if (train.types.length === 0) {
                console.log('No free places in this train.');

                reply('No free places in this train.');
            } else {
                const wagonTypes = train.types.map((type) => type.letter);
                const wagons = await uzClient.Wagon.list(train, wagonTypes[ 0 ]);
                const wagon = wagons.data.data.wagons[ 0 ];
         
                const coaches = await uzClient.Coach.list(train, wagon);

                console.log(coaches.data.data);

                reply(coaches.data.data);
            }

            
        });
    }

    async start() {
        this._bot.startPolling();
    }
}
