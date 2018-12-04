import cote from 'cote';
import Client from 'uz-booking-client';

const uzClient = new Client();

const uzClientResponder = new cote.Responder({
    name: 'uz responder',
    namespace: 'uz'
});

uzClientResponder.on('find-station', async (req) => {
    try {
        const stations = await uzClient.Station.find(req.stationName);

        return stations.data;
    } catch (err) {
        return err;
    }
});

uzClientResponder.on('find-train', async (req) => {
    const trains = await uzClient.Train.find(
        req.departureStation,
        req.targetStation,
        req.departureDate,
        req.time
    );

    return trains.data;
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
