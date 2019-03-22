export default {
  greetingMessage: firstName => `Чем могу помочь, ${firstName}?`,
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
  help: '🙏 Помощь',
  helpMessage: `
/start - инициализировать бота
/finddirecttickets - найти прямые билеты
/findinterchangetickets - найти билеты с пересадкой
/setlanguage - установить язык
/help - помощь`,
  searchResults: (trainsCount, departureDate) =>
    `Нашел ${trainsCount} поездов на ${departureDate}`,
  searchTicketsOnAnotherDate: '📅 Посмотреть на другую дату',
  searchAnotherDirectTrains: '🚉 Найти другие поезда',
  searchTicketsWithInterchange: '✈️🚲 Найти билеты с пересадкой',
  setLanguage: '🏳️ Выбрать язык',
  findTickets: '🎫 Найти билеты',
  remindMeWhenAvailable: 'Сообщить, когда появятся',
  tryAgain: 'Пожалуйста, попробуйте еще раз',
  chooseReturn: '🔙 Выбрать обратный билет',
  howManyTicketsYouNeed: 'Сколько билетов вам нужно?',
  sayWhenAvailable:
    'Хорошо, Я напомню вам, когда билеты снова появятся в наличии',
  letsTryAgain: 'Ну что, попробуем еще раз)'
};
