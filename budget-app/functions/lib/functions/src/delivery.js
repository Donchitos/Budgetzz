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
const handleNotificationDelivery = async (snap, context) => {
    const notification = snap.data();
    const userId = notification.userId;
    const notificationId = context.params.notificationId;
    functions.logger.info(`Processing notification ${notificationId} for user ${userId}.`);
    const prefRef = admin.firestore().collection("userNotificationPreferences").doc(userId);
    const prefSnap = await prefRef.get();
    if (!prefSnap.exists) {
        functions.logger.warn(`No notification preferences for user ${userId}.`);
        await snap.ref.update({ "status.delivery": "processed", "status.email": "failed", "status.push": "failed" });
        return;
    }
    const preferences = prefSnap.data();
    const statusUpdate = { "status.delivery": "processed" };
    if (preferences.doNotDisturb?.isEnabled) {
        functions.logger.info(`DND enabled for user ${userId}. Skipping delivery.`);
        await snap.ref.update({ ...statusUpdate, "status.email": "skipped", "status.push": "skipped" });
        return;
    }
    const deliveryPromises = [];
    if (preferences.channels.email.isEnabled) {
        deliveryPromises.push(sendEmail(userId, notification, preferences.channels.email.address));
    }
    if (preferences.channels.push.isEnabled) {
        deliveryPromises.push(sendPushNotification(userId, notification));
    }
    // In-app is always "delivered" from the backend's perspective.
    statusUpdate["status.inApp"] = "delivered";
    const results = await Promise.allSettled(deliveryPromises);
    results.forEach(result => {
        if (result.status === "fulfilled") {
            const { channel, status } = result.value;
            statusUpdate[`status.${channel}`] = status;
        }
        else {
            functions.logger.error("A delivery channel failed:", result.reason);
        }
    });
    await snap.ref.update(statusUpdate);
};
exports.handleNotificationDelivery = handleNotificationDelivery;
async function sendEmail(userId, notification, emailAddress) {
    functions.logger.info(`Attempting to send email to ${emailAddress} for notification ${notification.id}`);
    try {
        // Placeholder: In a real implementation, this would use an email service.
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
        functions.logger.info(`Email for notification ${notification.id} sent successfully.`);
        return { channel: "email", status: "sent" };
    }
    catch (error) {
        functions.logger.error(`Failed to send email for notification ${notification.id}:`, error);
        return { channel: "email", status: "failed" };
    }
}
async function sendPushNotification(userId, notification) {
    functions.logger.info(`Attempting push notification to user ${userId} for notification ${notification.id}`);
    try {
        // Placeholder: In a real implementation, this would use FCM.
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
        functions.logger.info(`Push notification for ${notification.id} sent successfully.`);
        return { channel: "push", status: "sent" };
    }
    catch (error) {
        functions.logger.error(`Failed to send push for notification ${notification.id}:`, error);
        return { channel: "push", status: "failed" };
    }
}
//# sourceMappingURL=delivery.js.map