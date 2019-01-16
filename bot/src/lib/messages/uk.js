export default {
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
        /start to create Notification
        /url - http(s)://example.com
        /selector to set up the query selector
        /stop to remove Notification
    `,
    searchResults: (trainsCount, departureDate) => `Знайшов ${trainsCount} поїздів на ${departureDate}`
};
