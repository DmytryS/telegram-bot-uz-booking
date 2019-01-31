
const trainLogo = (category) => {
    switch (category) {
        case 0:
            return '🚂';
        case 1:
            return '🚆';
        case 2:
            return '🚈';
        default:
            return '💁';
    }
};

const printTrainsList = (trains) => {
    let responseText = messages[ ctx.session.language ].searchResults(trains.length, ctx.scene.state.departureDate);
    const trainTypes = trains
        .reduce((types, train) => types.findIndex((type) => type === train.category) !== -1 ? types : [ ...types, train.category ], [])
        .sort();

    trainTypes.forEach((type) => {
        const trainCount = trains.filter((train) => train.category === type).length;

        switch (type) {
            case 0:
                responseText += `${trainLogo(type)} ${trainCount} - ${messages[ ctx.session.language ].passenger}\n`;
                break;
            case 1:
                responseText += `${trainLogo(type)} ${trainCount} - ${messages[ ctx.session.language ].intercity}\n`;
                break;
            case 2:
                responseText += `${trainLogo(type)} ${trainCount} - ${messages[ ctx.session.language ].transformer}\n`;
                break;
            default:
                responseText += `${trainLogo(type)} ${trainCount} - ${messages[ ctx.session.language ].unknownType}\n`;
        }
    });

    trains.forEach((train) => {
        responseText += '\n〰〰〰〰〰〰〰〰\n\n';
        responseText += `${trainLogo(train.category)} ${train.num} ${train.from.station}-${train.to.station}\n`;
        responseText += `🕙 ${messages[ ctx.session.language ].departure} ${train.from.time}\n`;
        responseText += `🕕 ${messages[ ctx.session.language ].arrival} ${train.to.time}\n`;
        responseText += `⌚️ ${messages[ ctx.session.language ].inTransit} ${train.travelTime}\n\n`;

        train.types.forEach((type) => {
            responseText += `🎫  ${type.title}: ${type.places}\n`;
        });
    });

    return responseText;
};

export default {
    printTrainsList
};
