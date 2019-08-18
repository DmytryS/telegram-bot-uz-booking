import messages from '../assets/messages/index.js'
import Job from '../models/job.js'

const stopWatch = async ctx => {
  const jobId = ctx.match[1]

  let job = await Job.findById(jobId)

  await job.markAsCanceled()

  ctx.reply(
    messages[ctx.session.language].jobStopped(
      job.departureStationName,
      job.arrivalStationName
    )
  )
}

export default stopWatch
