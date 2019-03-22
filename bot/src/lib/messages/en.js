export default {
  greetingMessage: firstName => `How can I help you, ${firstName} ?`,
  enterDepartureStation: 'Enter departure station',
  enterArrivalStation: 'Enter arrival station',
  errorOccured: '❌ Error occured',
  stationNotExists: "Station doesn't exists",
  choseStation: 'Chose station',
  choseDepartureDate: 'Chose departure date',
  departure: 'departure',
  arrival: 'arrival',
  inTransit: 'in transit',
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
  letsTryAgain: 'So, lets try again)'
};
