# UZ Booking Telegram Bot

[![channel icon](/images/follow_telegram.png)](http://t.me/railway_booking_bot) [![Build Status](https://travis-ci.com/DmytryS/telegram-bot-uz-booking.svg?branch=master)](https://travis-ci.com/DmytryS/telegram-bot-uz-booking)

https://booking.uz.gov.ua/ru/

# Start

To start all services:
```
docker-compose up
```
Do not forgot to change telegram bot token `BOT_TOKEN` at `./bot/.env` to yours.

# Start on kubernetes
Every microservice have deployments at `./%sevice-name%/provisioning`