import messages from '../assets/messages/index.js';

const help = ctx => ctx.reply(messages[ctx.session.language].helpMessage);

export default help;
