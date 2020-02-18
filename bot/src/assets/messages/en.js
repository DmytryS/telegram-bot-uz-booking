export default {
  greetingMessage: firstName => `How can I help you, ${firstName} ?`,
  byeMessage: 'See you later)',
  enterDepartureStation: 'Enter departure station',
  enterArrivalStation: 'Enter arrival station',
  errorOccured: '❌ Error occured',
  stationNotExists: 'Station doesn\'t exists',
  choseStation: 'Chose station',
  choseDepartureDate: 'Chose departure date',
  departure: 'departure',
  arrival: 'arrival',
  inTransit: 'in transit',
  berth: 'Berth / 3-cl. sleeper',
  deLuxe: 'De Luxe / 1-cl. sleeper',
  compartment: 'Compartment / 2-cl. sleeper',
  seating1stClass: 'Seating first class',
  seating2ndClass: 'Seating second class',
  seating3dClass: 'Seating third class',
  BERTH: 'Berth / 3-cl. sleeper',
  DE_LUXE: 'De Luxe / 1-cl. sleeper',
  COMPARTMENT: 'Compartment / 2-cl. sleeper',
  SEATING_1ST_CLASS: 'Seating first class',
  SEATING_2ND_CLASS: 'Seating second class',
  SEATING_3D_CLASS: 'Seating third class',
  selectAtLeastOneSeatType: 'Виберіть принаймні один тип сидіння',
  next: '➡️ Next️',
  selectWagonType: 'Select wagon type',
  passenger: 'passenger',
  intercity: 'Intercity+',
  transformer: 'transformers',
  unknownType: 'UNKNOWN TYPE',
  choseLanguage: 'Please, chose language',
  help: '🙏 Help',
  helpMessage: `
/start - start bot
/finddirecttickets - find train tickets
/findinterchangetickets - find interchage train tickets
/setlanguage - set language
/getwatchers - get ticket watchers list
/stop - stop bot
/help - help`,
  searchResults: (trainsCount, departureDate) =>
    `Found ${trainsCount} trains on ${departureDate}`,
  searchTicketsOnAnotherDate: '📅 Search tickets on another date',
  searchAnotherDirectTrains: '🚉 Find another trains',
  searchTicketsWithInterchange: '✈️🚲 Find tickets with interchange',
  setLanguage: '🏳️ Select language',
  findTickets: '🎫 Find tickets',
  remindMeWhenAvailable: 'Remind me, when get in stock',
  tryAgain: 'Please, try again',
  chooseReturn: '🔙 Choose return ticket',
  howManyTicketsYouNeed: 'How many tickets do you need?',
  sayWhenAvailable: 'Ok, I will remind you when tickets become available again',
  letsTryAgain: 'So, lets try again)',
  watcherFoundTicket: 'Tickets now are available. Hurry up!',
  watcherDidnotFoundTicket: 'I`m so sorry, I didn`t find ticket for you',
  ticketWatchers: watchersCount =>
    `Currently I'm looking after ${watchersCount} directions`,
  jobStopped: (departureStation, arrivalStation, reason) =>
    `Looking after tickets ${departureStation} - ${arrivalStation} stopped ${reason ||
    ''}`,
  alreadyWatching: 'I`m already watching for this direction',
  buy: 'Buy',
}
