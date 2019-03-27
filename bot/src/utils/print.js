import moment from 'moment';
import { messages } from '../lib';

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
    responseText += `${trainLogo(train.category)} ${train.num} ${
      train.from.station
    }-${train.to.station}\n`;
    responseText += `🕙 ${messages[language].departure} ${train.from.time}\n`;
    responseText += `🕕 ${messages[language].arrival} ${train.to.time}\n`;
    responseText += `⌚️ ${messages[language].inTransit} ${
      train.travelTime
    }\n\n`;

    train.types.forEach(type => {
      responseText += `🎫  ${type.title}: ${type.places}\n`;
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
  printWatchersList
};
