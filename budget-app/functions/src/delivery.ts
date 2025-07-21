import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Notification, UserNotificationPreference, DeliveryStatus } from "../../src/types/alerts";

/**
 * Handles the delivery of a newly created notification to the appropriate channels
 * based on user preferences.
 *
 * @param {functions.firestore.QueryDocumentSnapshot} snap The snapshot of the created notification document.
 * @param {functions.EventContext} context The event context.
 */
export const handleNotificationDelivery = async (
  snap: functions.firestore.QueryDocumentSnapshot,
  context: functions.EventContext
): Promise<void> => {
  const notification = snap.data() as Notification;
  const { userId } = notification;
  const { notificationId } = context.params;

  functions.logger.info(`Processing notification '${notificationId}' for user '${userId}'.`);

  const userPrefDoc = await admin.firestore().collection("userNotificationPreferences").doc(userId).get();

  if (!userPrefDoc.exists) {
    functions.logger.warn(`No notification preferences found for user '${userId}'. Marking as failed.`);
    await snap.ref.update({ "status.delivery": "processed", "status.email": "failed", "status.push": "failed" });
    return;
  }

  const preferences = userPrefDoc.data() as UserNotificationPreference;
  const statusUpdate: { [key: string]: DeliveryStatus | 'processed' } = { "status.delivery": "processed" };

  // Respect Do Not Disturb settings
  if (preferences.doNotDisturb?.isEnabled) {
    functions.logger.info(`DND is enabled for user '${userId}'. Skipping delivery.`);
    await snap.ref.update({ ...statusUpdate, "status.email": "skipped", "status.push": "skipped" });
    return;
  }

  const deliveryPromises: Promise<{ channel: 'email' | 'push'; status: DeliveryStatus }>[] = [];

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
    } else {
      // Log the failure of a specific delivery channel
      functions.logger.error(`A delivery channel failed for notification '${notificationId}':`, result.reason);
    }
  });

  await snap.ref.update(statusUpdate);
  functions.logger.info(`Finished processing notification '${notificationId}'.`);
};

/**
 * Simulates sending an email notification.
 * In a real application, this would integrate with an email service like SendGrid or Mailgun.
 *
 * @param {string} userId The ID of the user receiving the email.
 * @param {Notification} notification The notification object.
 * @param {string} emailAddress The email address to send to.
 * @returns {Promise<{ channel: "email"; status: DeliveryStatus }>} The result of the email delivery attempt.
 */
async function sendEmail(
  userId: string,
  notification: Notification,
  emailAddress: string
): Promise<{ channel: "email"; status: DeliveryStatus }> {
  functions.logger.info(`Attempting to send email to '${emailAddress}' for notification '${notification.id}'.`);
  
  // --- Placeholder for actual email sending logic ---
  // Example: await emailService.send({ to: emailAddress, subject: notification.content.title, body: notification.content.body });
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 150));
    functions.logger.info(`Successfully simulated sending email for notification '${notification.id}'.`);
    return { channel: "email", status: "sent" };
  } catch (error) {
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
async function sendPushNotification(
  userId: string,
  notification: Notification
): Promise<{ channel: "push"; status: DeliveryStatus }> {
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
  } catch (error) {
    functions.logger.error(`Failed to send push notification for '${notification.id}':`, error);
    return { channel: "push", status: "failed" };
  }
}