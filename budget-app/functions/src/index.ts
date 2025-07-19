import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

// A simple "hello world" function to verify the setup
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

import { handleNotificationDelivery } from "./delivery";
import { generateBudgetRecommendations } from "./budgetRecommender";

// Export the alert engine
export { runAlertEngine } from "./alertEngine";

// Firestore trigger for new notifications
export const onNotificationCreated = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(handleNotificationDelivery);

// Export the budget recommender
export { generateBudgetRecommendations };