import { User } from '../models/index.js';

const getUserLanguage = async (ctx, next) => {
  if (!ctx.session.language) {
    const telegramId = ctx.from.id;
    const user = await User.findOne({ telegramId });
    const language = (user && user.language) || 'en';

    ctx.session.language = language;
  }

  await next();
};

export default {
  getUserLanguage,
};
