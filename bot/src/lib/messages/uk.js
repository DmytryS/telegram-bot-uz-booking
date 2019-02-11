export default {
    greetingMessage: (firstName) => `Чим можу допомогти, ${firstName}?`,
    enterDepartureStation: 'Введiть станцiю вiдправлення',
    enterArrivalStation: 'Введiть станцiю прибуття',
    errorOccured: '❌ Відбулася помилка',
    stationNotExists: 'Такий станції не існує',
    choseStation: 'Виберіть станцію',
    choseDepartureDate: 'Виберіть дату відправлення',
    departure: 'відправлення',
    arrival: 'прибуття',
    inTransit: 'в дорозі',
    passenger: 'пасажирські',
    intercity: 'швидкісні Интерсити+',
    transformer: 'трансформери',
    unknownType: 'UNKNOWN TYPE',
    choseLanguage: 'Будь ласка, виберіть мову',
    help: `
/findtickets - find train tickets
/setlanguage - set language
/help - help`,
    searchResults: (trainsCount, departureDate) => `Знайшов ${trainsCount} поїздів на ${departureDate}`,
    searchTicketsOnAnotherDate: '📅 Подивитися на іншу дату',
    searchAnotherDirectTrains: '🚉 Знайти інші поїзди',
    searchTicketsWithInterchange: '✈️🚲 Знайти квитки з пересадкою',
    setLanguage: '🏳️ Обрати мову',
    findTickets: '🎫 Знайти квитки',
    remindMeWhenAvailable: 'Повідомити, коли будуть у наявності',
    tryAgain: 'Будьласка, спробуйте ще',
    chooseReturn: 'Вибрати зворотний квиток'
};
