export default {
  greetingMessage: firstName => `Чим можу допомогти, ${firstName}?`,
  byeMessage: 'Допобачення)',
  enterDepartureStation: 'Введiть станцiю вiдправлення',
  enterArrivalStation: 'Введiть станцiю прибуття',
  errorOccured: '❌ Відбулася помилка',
  stationNotExists: 'Такий станції не існує',
  choseStation: 'Виберіть станцію',
  choseDepartureDate: 'Виберіть дату відправлення',
  departure: 'відправлення',
  arrival: 'прибуття',
  inTransit: 'в дорозі',
  berth: 'Плацкарт',
  deLuxe: 'Люкс',
  compartment: 'Купе',
  seating1stClass: 'Сидячий першого класу',
  seating2ndClass: 'Сидячий другого класу',
  seating3dClass: 'Сидячий третього класу',
  selectAtLeastOneSeatType: 'Выберите хотябы один тип',
  next: '➡️ Далi',
  selectWagonType: 'Оберiть тип вагону',
  passenger: 'пасажирські',
  intercity: 'швидкісні Интерсити+',
  transformer: 'трансформери',
  unknownType: 'UNKNOWN TYPE',
  choseLanguage: 'Будь ласка, виберіть мову',
  help: '🙏 Допомога',
  helpMessage: `
/start - ініціалізувати бота
/finddirecttickets - знайти прямі квитки
/findinterchangetickets - знайти квитки з пересадкою
/setlanguage - встановити мову
/getwatchers - список напрямків, за якими я стежу
/stop - зупинити бота
/help - допомога`,
  searchResults: (trainsCount, departureDate) =>
    `Знайшов ${trainsCount} поїздів на ${departureDate}`,
  searchTicketsOnAnotherDate: '📅 Подивитися на іншу дату',
  searchAnotherDirectTrains: '🚉 Знайти інші поїзди',
  searchTicketsWithInterchange: '✈️🚲 Знайти квитки з пересадкою',
  setLanguage: '🏳️ Обрати мову',
  findTickets: '🎫 Знайти квитки',
  remindMeWhenAvailable: 'Повідомити, коли будуть у наявності',
  tryAgain: 'Будьласка, спробуйте ще',
  chooseReturn: '🔙 Вибрати зворотний квиток',
  howManyTicketsYouNeed: 'Скільки квитків потрібно?',
  sayWhenAvailable:
    "Добре, Я нагадаю вам, коли квитки знов з'являться в наявності",
  letsTryAgain: 'Ну що, давайте спробуємо знову)',
  watcherFoundTicket: 'Знайшов квитки',
  watcherDidnotFoundTicket: 'Мені дуже шкода, Я не змiг знайти квиток для вас',
  ticketWatchers: watchersCount =>
    `На даний момент я стежу за ${watchersCount} напрямками`,
  jobStopped: (departureStation, arrivalStation) =>
    `Спостереження за квитками на ${departureStation} - ${arrivalStation} припинено`,
  alreadyWatching: 'Я вже спостерігаю за цим напрямком',
  getWagons: 'Показати вагони'
};
