import { Markup } from 'telegraf';
import messages from './messages';
import { User, Job } from '../models';
import { print } from '../utils';

const start = async ctx => {
  await User.updateOne(
    {
      telegramId: ctx.update.message.from.id
    },
    {
      telegramId: ctx.update.message.from.id,
      firstName: ctx.update.message.from.first_name,
      lastName: ctx.update.message.from.last_name,
      userName: ctx.update.message.from.username
    },
    {
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  ctx.session.language = ctx.session.language || 'en';

  ctx.reply(
    messages[ctx.session.language].greetingMessage(ctx.from.first_name),
    Markup.inlineKeyboard([
      Markup.callbackButton(
        messages[ctx.session.language].findTickets,
        'FIND_DIRECT_TICKETS'
      ),
      Markup.callbackButton(
        messages[ctx.session.language].setLanguage,
        'SET_LANGUAGE'
      ),
      Markup.callbackButton(messages[ctx.session.language].help, 'HELP')
    ]).extra()
  );

  // ctx.scene.enter('setlanguage');
};

const findDirectTickets = ctx => {
  ctx.session.ticketSearchType = 'DIRECT';
  ctx.scene.enter('selectDepartureStation');
};

const findInterchangeTickets = ctx => {
  ctx.session.ticketSearchType = 'INTERCHANGE';
  ctx.scene.enter('selectDepartureStation');
};

const setLanguage = ctx => ctx.scene.enter('setlanguage');

const getWatchers = async ctx => {
  const jobs = await Job.find({
    status: 'ACTIVE'
  }).populate({
    path: 'user',
    match: {
      telegramId: ctx.from.id
    }
  });

  ctx.reply(print.printWatchersList(jobs, ctx.session.language));
};

const stop = ctx => {
  // TODO

  ctx.reply(messages[ctx.session.language].byeMessage);
};

const stopWatch = async ctx => {
  const jobId = ctx.match[1];

  let job = await Job.findById(jobId);

  await job.markAsCanceled();

  ctx.reply(
    messages[ctx.session.language].jobStopped(
      job.departureStationName,
      job.arrivalStationName
    )
  );
};

const help = ctx => ctx.reply(messages[ctx.session.language].helpMessage);

export default {
  start,
  findDirectTickets,
  findInterchangeTickets,
  setLanguage,
  getWatchers,
  stop,
  stopWatch,
  help
};
