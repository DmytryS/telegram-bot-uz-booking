import "dotenv/config";
import UzClient from "uz-booking-client";
import { logger, queue } from "./services";

const notificationsIntervalId = setInterval(() => {
  subscribeToNotifications().then(isConnected => {
    if (isConnected) {
      clearInterval(notificationsIntervalId);
      console.log("Connected to notifications");
    }
  });
}, config.rabbitReconnectInterval);
