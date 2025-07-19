import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Notification, UserNotificationPreference, DeliveryStatus } from "../../src/types/alerts";

export const handleNotificationDelivery = async (
  snap: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
) => {
  const notification = snap.data() as Notification;
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

  const preferences = prefSnap.data() as UserNotificationPreference;
  const statusUpdate: { [key: string]: any } = { "status.delivery": "processed" };

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
    } else {
      functions.logger.error("A delivery channel failed:", result.reason);
    }
  });

  await snap.ref.update(statusUpdate);
};

async function sendEmail(
  userId: string,
  notification: Notification,
  emailAddress: string
): Promise<{ channel: "email"; status: DeliveryStatus }> {
  functions.logger.info(`Attempting to send email to ${emailAddress} for notification ${notification.id}`);
  try {
    // Placeholder: In a real implementation, this would use an email service.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
    functions.logger.info(`Email for notification ${notification.id} sent successfully.`);
    return { channel: "email", status: "sent" };
  } catch (error) {
    functions.logger.error(`Failed to send email for notification ${notification.id}:`, error);
    return { channel: "email", status: "failed" };
  }
}

async function sendPushNotification(
  userId: string,
  notification: Notification
): Promise<{ channel: "push"; status: DeliveryStatus }> {
  functions.logger.info(`Attempting push notification to user ${userId} for notification ${notification.id}`);
  try {
    // Placeholder: In a real implementation, this would use FCM.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async work
    functions.logger.info(`Push notification for ${notification.id} sent successfully.`);
    return { channel: "push", status: "sent" };
  } catch (error) {
    functions.logger.error(`Failed to send push for notification ${notification.id}:`, error);
    return { channel: "push", status: "failed" };
  }
}