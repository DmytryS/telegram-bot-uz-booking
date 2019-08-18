import moment from 'moment';
import messages from '../assets/messages/index.js';

const trainLogo = category => {
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

const placeTypes = {
  'К': 'COMPARTMENT',
  'Л': 'DE_LUXE',
  'П': 'BERTH',
  'С-1': 'SEATING_1ST_CLASS',
  'С-2': 'SEATING_2ND_CLASS',
  'С-3': 'SEATING_3D_CLASS',
}

const getPlaceType = (wagonType) => placeTypes[`${wagonType.type}${wagonType.class ? '-' + wagonType.class : ''}`]

/**
 * Prints results of train search
 * @param {Array<Train>} trains array of trains
 * @param {String} departureDate departure date string
 * @param {String} language language string
 */
const printTrainsList = (trains, departureDate, language) => {
  let responseText = `${messages[language].searchResults(
    trains.length,
    departureDate
  )}\n`;
  const trainTypes = trains
    .reduce(
      (types, train) =>
        types.findIndex(type => type === train.category) !== -1
          ? types
          : [...types, train.category],
      []
    )
    .sort();

  trainTypes.forEach(type => {
    const trainCount = trains.filter(train => train.category === type).length;

    switch (type) {
      case 0:
        responseText += `${trainLogo(type)} ${trainCount} - ${
          messages[language].passenger
          }\n`;
        break;
      case 1:
        responseText += `${trainLogo(type)} ${trainCount} - ${
          messages[language].intercity
          }\n`;
        break;
      case 2:
        responseText += `${trainLogo(type)} ${trainCount} - ${
          messages[language].transformer
          }\n`;
        break;
      default:
        responseText += `${trainLogo(type)} ${trainCount} - ${
          messages[language].unknownType
          }\n`;
    }
  });

  trains.forEach(train => {
    responseText += '\n〰〰〰〰〰〰〰〰\n\n';
    responseText += `${trainLogo(train.category)} ${train.number} ${
      train.from.station_title
      }-${train.to.station_title}\n`;
    responseText += `🕙 ${messages[language].departure} ${train.from.date}\n`;
    responseText += `🕕 ${messages[language].arrival} ${train.to.date}\n`;
    responseText += `⌚️ ${messages[language].inTransit} ${
      train.travel_time
      }\n\n`;

    train.wagon_types.forEach(type => {
      responseText += `🎫  ${messages[language][getPlaceType(type)]}: ${type.places}\n`;
    });
  });

  return responseText;
};

/**
 * Prints tickets watch jobs list
 * @param {Array<Train>} watchers array of watch jobs
 * @param {String} language language string
 * @returns {String} formatted response
 */
const printWatchersList = (watchers, language) => {
  let responseText = `${messages[language].ticketWatchers(watchers.length)}\n`;

  watchers.forEach(watcher => {
    responseText += `⚪️ ${watcher.departureStationName} - ${
      watcher.arrivalStationName
      }  ${moment(watcher.departureDate).format(
        'YYYY-MM-DD'
      )} /stop_watch_${watcher._id.toString()} \n`;
  });

  return responseText;
};

export default {
  printTrainsList,
  printWatchersList,
};
