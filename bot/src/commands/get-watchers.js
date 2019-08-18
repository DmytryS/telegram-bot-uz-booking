import print from '../utils/print.js'
import { User, Job } from '../models/index.js'

const getWatchers = async ctx => {
  const user = await User.findOne({ telegramId: ctx.from.id })
  const jobs = await Job.find({
    status: 'ACTIVE',
    user: user._id,
  })

  ctx.reply(print.printWatchersList(jobs, ctx.session.language))
}

export default getWatchers
