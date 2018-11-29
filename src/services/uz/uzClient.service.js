import cote from 'cote';
import Client from 'uz-booking-client';

const uzClient = new Client();

const uzClientResponder = new cote.Responder({
    name: 'uz responder',
    namespace: 'uz'
    // respondsTo: [ 'buy' ]
});

uzClientResponder.on('find-station', async (req) => {
    console.log('Find station', req);
    
    const stations = await uzClient.Station.find(req.stationName);

    return stations.data;
});

uzClientResponder.on('find-train', (req, cb) => {
    uzClient.Train.find(
        req.departureStation,
        req.targetStation,
        req.departureDate,
        req.time,
        cb);
});

uzClientResponder.on('list-wagons', (req, cb) => {
    uzClient.Wagon.list(
        req.train,
        req.wagonType,
        cb
    );
});

uzClientResponder.on('list-coaches', (req, cb) => {
    uzClient.Coach.list(
        req.train,
        req.wagon,
        cb
    );
});
