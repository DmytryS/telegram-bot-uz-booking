import WizardScene from 'telegraf/scenes/wizard/index.js';
import Markup from 'telegraf/markup.js';
import moment from 'moment';
import UzClient from 'uz-booking-client';
import logger from '../lib/logger.js';
import messages from '../assets/messages/index.js';
import { dateSelectEmitter, calendar } from '../index.js';
import print from '../utils/print.js';

const sendErrorMessage = (ctx, message) =>
    ctx.reply(`${messages[ctx.session.language].errorOccured}\n${message || ''}`);

const selectDepartureDate = new WizardScene(
    'selectDepartureDate',
    ctx => {
        ctx.reply(
            messages[ctx.session.language].choseDepartureDate,
            calendar
                .setMinDate(moment().toDate())
                .setMaxDate(
                    moment()
                        .add(1, 'month')
                        .toDate()
                )
                .getCalendar()
        );

        // eslint-disable-next-line
        const onDateSelected = async date => {
            ctx.session.departureDate = date;

            ctx.reply(date);

            let trains = [];

            try {
                const uzClient = new UzClient.ApiV2(ctx.session.language);
                let response = false;

                // eslint-disable-next-line
                switch (ctx.session.ticketSearchType) {
                    case 'DIRECT':
                        response = await uzClient.Train.find(
                            ctx.session.departureStation,
                            ctx.session.arrivalStation,
                            ctx.session.departureDate,
                            '00:00:00'
                        );
                        break;
                    case 'INTERCHANGE':
                        response = await uzClient.Train.findInterchange(
                            ctx.session.departureStation,
                            ctx.session.arrivalStation,
                            ctx.session.departureDate,
                            '00:00'
                        );
                        break;
                }

                if (!response || (response.data.data && !response.data.data.trains)) {
                    throw new Error(response.data.data);
                }

                trains = response.data.data.trains.filter(
                    train => train.wagon_types.length > 0
                );

                const inlineKeyboardButtons = [
                    [
                        Markup.callbackButton(
                            messages[ctx.session.language].searchTicketsOnAnotherDate,
                            'FIND_ANOTHER_DATE_TICKETS'
                        ),
                    ],
                    [
                        Markup.callbackButton(
                            messages[ctx.session.language].searchAnotherDirectTrains,
                            'FIND_DIRECT_TICKETS'
                        ),
                    ],
                    [
                        Markup.callbackButton(
                            messages[ctx.session.language].setLanguage,
                            'SET_LANGUAGE'
                        ),
                    ],
                    [
                        Markup.callbackButton(
                            messages[ctx.session.language].remindMeWhenAvailable,
                            'REMIND_ME_WHEN_AVAILABLE'
                        ),
                    ],
                ];

                if (trains.length === 0) {
                    inlineKeyboardButtons.push([
                        Markup.callbackButton(
                            messages[ctx.session.language].searchTicketsWithInterchange,
                            'FIND_INTERCHANGE_TICKETS'
                        ),
                    ]);
                } else {
                    inlineKeyboardButtons.push([
                        Markup.callbackButton(
                            messages[ctx.session.language].chooseReturn,
                            'FIND_RETURN_TICKET'
                        ),
                    ]);
                }

                ctx.reply(
                    print.printTrainsList(
                        trains,
                        ctx.session.departureDate,
                        ctx.session.language
                    ),
                    Markup.inlineKeyboard(inlineKeyboardButtons).extra()
                );

                return ctx.wizard.next();
            } catch (err) {
                logger.error('An error occured during trains fetch', err);
                sendErrorMessage(
                    ctx,
                    err.response && err.response.status === 503
                        ? 'Service unavailable'
                        : err.message
                );

                ctx.reply(messages[ctx.session.language].tryAgain);
                ctx.scene.enter('initialScene');
            }
        };

        const userId =
            (ctx.update.message && ctx.update.message.from.id) ||
            (ctx.update.callback_query && ctx.update.callback_query.from.id);

        dateSelectEmitter.once(`dateSelect-${userId}`, onDateSelected);
    },
    ctx => {
        if (!ctx || !ctx.callbackQuery || !ctx.callbackQuery.data) {
            ctx.scene.leave();
        } else {
            switch (ctx.callbackQuery.data) {
                case 'FIND_ANOTHER_DATE_TICKETS':
                    ctx.scene.enter('selectDepartureDate');
                    break;
                case 'FIND_DIRECT_TICKETS':
                    ctx.session.ticketSearchType = 'DIRECT';
                    ctx.scene.enter('selectDepartureStation');
                    break;
                case 'SET_LANGUAGE':
                    ctx.scene.enter('setlanguage');
                    break;
                case 'FIND_INTERCHANGE_TICKETS':
                    // TODO
                    ctx.session.ticketSearchType = 'INTERCHANGE';
                    ctx.scene.enter('selectDepartureDate');
                    break;
                case 'REMIND_ME_WHEN_AVAILABLE':
                    ctx.scene.enter('selectSeatType');
                    break;
                case 'FIND_RETURN_TICKET':
                    // eslint-disable-next-line
                    const { departureStation } = ctx.session;

                    ctx.session.ticketSearchType = 'DIRECT';
                    ctx.session.departureStation = ctx.session.arrivalStation;
                    ctx.session.arrivalStation = departureStation;
                    ctx.scene.enter('selectDepartureDate');
                    break;
                default:
                    ctx.scene.leave();
                    break;
            }
        }
    }
);

export default selectDepartureDate;
