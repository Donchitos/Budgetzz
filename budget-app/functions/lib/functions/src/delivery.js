"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNotificationDelivery = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Handles the delivery of a newly created notification to the appropriate channels
 * based on user preferences.
 *
 * @param {functions.firestore.QueryDocumentSnapshot} snap The snapshot of the created notification document.
 * @param {functions.EventContext} context The event context.
 */
const handleNotificationDelivery = async (snap, context) => {
    const notification = snap.data();
    const { userId } = notification;
    const { notificationId } = context.params;
    functions.logger.info(`Processing notification '${notificationId}' for user '${userId}'.`);
    const userPrefDoc = await admin.firestore().collection("userNotificationPreferences").doc(userId).get();
    if (!userPrefDoc.exists) {
        functions.logger.warn(`No notification preferences found for user '${userId}'. Marking as failed.`);
        await snap.ref.update({ "status.delivery": "processed", "status.email": "failed", "status.push": "failed" });
        return;
    }
    const preferences = userPrefDoc.data();
    const statusUpdate = { "status.delivery": "processed" };
    // Respect Do Not Disturb settings
    if (preferences.doNotDisturb?.isEnabled) {
        functions.logger.info(`DND is enabled for user '${userId}'. Skipping delivery.`);
        await snap.ref.update({ ...statusUpdate, "status.email": "skipped", "status.push": "skipped" });
        return;
    }
    const deliveryPromises = [];
    if (preferences.channels.email.isEnabled && preferences.channels.email.address) {
        deliveryPromises.push(sendEmail(userId, notification, preferences.channels.email.address));
    }
    if (preferences.channels.push.isEnabled) {
        deliveryPromises.push(sendPushNotification(userId, notification));
    }
    // In-app notifications are considered delivered immediately upon creation.
    statusUpdate["status.inApp"] = "delivered";
    const results = await Promise.allSettled(deliveryPromises);
    results.forEach(result => {
        if (result.status === "fulfilled") {
            const { channel, status } = result.value;
            statusUpdate[`status.${channel}`] = status;
        }
        else {
            // Log the failure of a specific delivery channel
            functions.logger.error(`A delivery channel failed for notification '${notificationId}':`, result.reason);
        }
    });
    await snap.ref.update(statusUpdate);
    functions.logger.info(`Finished processing notification '${notificationId}'.`);
};
exports.handleNotificationDelivery = handleNotificationDelivery;
/**
 * Simulates sending an email notification.
 * In a real application, this would integrate with an email service like SendGrid or Mailgun.
 *
 * @param {string} userId The ID of the user receiving the email.
 * @param {Notification} notification The notification object.
 * @param {string} emailAddress The email address to send to.
 * @returns {Promise<{ channel: "email"; status: DeliveryStatus }>} The result of the email delivery attempt.
 */
async function sendEmail(userId, notification, emailAddress) {
    functions.logger.info(`Attempting to send email to '${emailAddress}' for notification '${notification.id}'.`);
    // --- Placeholder for actual email sending logic ---
    // Example: await emailService.send({ to: emailAddress, subject: notification.content.title, body: notification.content.body });
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 150));
        functions.logger.info(`Successfully simulated sending email for notification '${notification.id}'.`);
        return { channel: "email", status: "sent" };
    }
    catch (error) {
        functions.logger.error(`Failed to send email for notification '${notification.id}':`, error);
        return { channel: "email", status: "failed" };
    }
}
/**
 * Simulates sending a push notification via Firebase Cloud Messaging (FCM).
 *
 * @param {string} userId The ID of the user to send the push notification to.
 * @param {Notification} notification The notification object.
 * @returns {Promise<{ channel: "push"; status: DeliveryStatus }>} The result of the push notification delivery attempt.
 */
async function sendPushNotification(userId, notification) {
    functions.logger.info(`Attempting to send push notification to user '${userId}' for notification '${notification.id}'.`);
    // --- Placeholder for actual FCM logic ---
    // 1. Get user's FCM tokens from Firestore.
    // 2. Construct FCM payload.
    // 3. Use admin.messaging().sendToDevice(tokens, payload).
    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        functions.logger.info(`Successfully simulated sending push notification for '${notification.id}'.`);
        return { channel: "push", status: "sent" };
    }
    catch (error) {
        functions.logger.error(`Failed to send push notification for '${notification.id}':`, error);
        return { channel: "push", status: "failed" };
    }
}
//# sourceMappingURL=delivery.js.map