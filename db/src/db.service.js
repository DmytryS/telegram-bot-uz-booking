import '@babel/polyfill';
import cote from 'cote';
import mongoose from 'mongoose';
import { User } from './models';

mongoose.connect(process.env.DB_URL);

const dbClientResponder = new cote.Responder({
    name: 'db responder',
    namespace: 'db'
});

dbClientResponder.on('create-user', async (req) => {
    try {
        console.log(99999999999999, User);
        

        let user = await User.findOne({ telegramId: req.user.telegramId });

        console.log(1111, user);
        if (!user) {
            user = await new User(req.user).save();
        }

        console.log(222, user);
        

        return user;
    } catch (err) {
        console.log(5555, err);
        
        return err;
    }
});

dbClientResponder.on('find-user', async (req) => {
    try {
        let user = await User.findOne({ telegramId: req.user.telegramId });

        return user;
    } catch (err) {
        return err;
    }
});

dbClientResponder.on('update-user', async (req) => {
    try {
        let user = await User.findOne({ telegramId: req.user.telegramId });

        delete req.user.telegramId;

        for(const key in req.user) {
            user[ key ] = req.user[ key ];
        }

        user = await user.save();

        return user;
    } catch (err) {
        return err;
    }
});
