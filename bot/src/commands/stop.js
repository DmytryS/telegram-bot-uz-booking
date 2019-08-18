import messages from '../assets/messages/index.js'
import { User, Job } from '../models/index.js'

const stop = async ctx => {
  const telegramId = ctx.from.id
  const user = await User.findOne({ telegramId })

  await Job.markAsCanceledForUser(user._id.toString())
  await user.stopBot()

  ctx.reply(messages[ctx.session.language].byeMessage)
}

export default stop
