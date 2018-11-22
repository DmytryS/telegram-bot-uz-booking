import cote from 'cote';
import Client from 'uz-booking-client';


const client = new Client();
const uzClient = new cote.Responder({
    name: 'uz api client service',
    key: 'uz'
});

uzClient.on('find-station', (req, cb) => {
    client.Station.find(req.stationName, cb);
});

uzClient.on('find-train', (req, cb) => {
    client.Train.find(
        req.departureStation,
        req.targetStation,
        req.ticketsDate,
        req.time,
        cb);
});

uzClient.on('list-wagons', (req, cb) => {
    client.Wagon.list(
        req.train,
        req.wagonType,
        cb
    );
});

uzClient.on('list-coaches', (req, cb) => {
    client.Coach.list(
        req.train,
        req.wagon,
        cb
    );
});
