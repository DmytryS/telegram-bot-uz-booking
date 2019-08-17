export default {
  greetingMessage: firstName => `Чем могу помочь, ${firstName}?`,
  byeMessage: 'Пока)',
  enterDepartureStation: 'Введите станцию отправления',
  enterArrivalStation: 'Введите станцию прибытия',
  errorOccured: '❌ Произошла ошибка',
  stationNotExists: 'Такой станции не существует',
  choseStation: 'Выберите станцию',
  choseDepartureDate: 'Выберите дату отправления',
  departure: 'отправление',
  arrival: 'прибытие',
  inTransit: 'в пути',
  berth: 'Плацкарт',
  deLuxe: 'Люкс',
  compartment: 'Купе',
  seating1stClass: 'Сидячий первого класса',
  seating2ndClass: 'Сидячий второго класса',
  seating3dClass: 'Сидячий третьего класса',
  BERTH: 'Плацкарт',
  DE_LUXE: 'Люкс',
  COMPARTMENT: 'Купе',
  SEATING_1ST_CLASS: 'Сидячий первого класса',
  SEATING_2ND_CLASS: 'Сидячий второго класса',
  SEATING_3D_CLASS: 'Сидячий третьего класса',
  selectAtLeastOneSeatType: 'Выберите хотябы один тип',
  next: '➡️ Далее',
  selectWagonType: 'Выберите тип вагона',
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
/getwatchers - список направлений, за которыми я слежу
/stop - остановить бота
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
  letsTryAgain: 'Ну что, попробуем еще раз)',
  watcherFoundTicket: 'Нашел билеты',
  watcherDidnotFoundTicket:
    'Прошу прощения, я не смог найти билет для вас (((((',
  ticketWatchers: watchersCount =>
    `На даний момент я слежу за ${watchersCount} направлениями`,
  jobStopped: (departureStation, arrivalStation, reason) =>
    `Наблюдение за билетами на ${departureStation} - ${arrivalStation} остановлено ${reason ||
    ''}`,
  alreadyWatching: 'Я уже слежу за этим направлением',
};
