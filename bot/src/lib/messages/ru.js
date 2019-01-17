export default {
    enterDepartureStation: 'Введите станцию отправления',
    enterArrivalStation: 'Введите станцию прибытия',
    errorOccured: '❌ Произошла ошибка',
    stationNotExists: 'Такой станции не существует',
    choseStation: 'Выберите станцию',
    choseDepartureDate: 'Выберите дату отправления',
    departure: 'отправление',
    arrival: 'прибытие',
    inTransit: 'в пути',
    passenger: 'пассажирские',
    intercity: 'скоростные Интерсити+',
    transformer: 'трансформеры',
    unknownType: 'UNKNOWN TYPE',
    choseLanguage: 'Пожалуйста, выберите язык',
    help: `
/findtickets - find train tickets
/setlanguage - set language
/help - help`,
    searchResults: (trainsCount, departureDate) => `Нашел ${trainsCount} поездов на ${departureDate}`
};
