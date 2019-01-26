import { Session } from '../models';

export default class TelegrafMongooseSession {
    constructor(options) {
        this.options = Object.assign({
            collection: 'Session',
            property: 'session',
            getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`
        }, options);
    }

    getSession(key) {
        return new Promise((resolve, reject) => {
            Session.findOne({ key }).exec().then((session) => {
                if (session) {
                    // debug('session state', key, session.session);
                    resolve(session.session);
                }
                resolve({});
            }).catch((err) => reject(err));
        });
    }

    clearSession(key) {
        // debug('clear session', key);
        return Session.findOneAndRemove({ key }).exec();
    }

    saveSession(key, session) {
        if (!session || Object.keys(session).length === 0) {
            return this.clearSession(key);
        }
        // debug('save session', key, session);
        return Session.findOneAndUpdate({ key }, { session }, { upsert: true }).exec();
    }

    middleware() {
        return (ctx, next) => {
            const key = this.options.getSessionKey(ctx);

            if (!key) {
                return next();
            }
            return this.getSession(key).then((session) => {
                // debug('session snapshot', key, session);
                Object.defineProperty(ctx, this.options.property, {
                    get: function () {
                        return session;
                    },
                    set: function (newValue) {
                        session = Object.assign({}, newValue);
                    }
                });
                return next().then(() => this.saveSession(key, session));
            });
        };
    }
}
