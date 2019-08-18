import WizardScene from 'telegraf/scenes/wizard/index.js';
import Markup from 'telegraf/markup.js';
import Extra from 'telegraf/extra.js'
import { User } from '../models/index.js';
import messages from '../assets/messages/index.js';

const setLanguage = new WizardScene(
    'setlanguage',
    ctx => {
        ctx.session.languages = {
            '🇬🇧 English': 'en',
            '🇷🇺 Русский': 'ru',
            '🇺🇦 Українська': 'uk',
        };

        ctx.reply(
            messages[ctx.session.language].choseLanguage,
            Extra.markup(
                Markup.keyboard(['🇬🇧 English', '🇷🇺 Русский', '🇺🇦 Українська'])
                    .oneTime()
                    .resize()
            )
        );

        ctx.wizard.next();
    },
    async ctx => {
        ctx.session.language = ctx.session.languages[ctx.message.text];

        await User.updateOne(
            {
                telegramId: ctx.update.message.from.id,
            },
            {
                language: ctx.session.languages[ctx.message.text],
            }
        );

        ctx.scene.enter('initialScene');
    }
);

export default setLanguage;
