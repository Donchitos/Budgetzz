# Alert & Notification System: Technical Architecture

## 1. Overview

This document outlines the technical architecture for a new comprehensive Alert & Notification System. The system's purpose is to transform the application from a reactive expense tracker into a proactive financial assistant by notifying users of important financial events. This will help users manage their finances more effectively, avoid issues like late fees, and stay on track with their financial goals.

The architecture is designed to be scalable, flexible, and deeply integrated with the existing application components, leveraging the current Firebase-centric technology stack.

## 2. Data Models

Three new core Firestore collections will be introduced to support the alert system. These models will store the rules that trigger alerts, user preferences for receiving them, and a log of every notification sent.

### 2.1. `alertRules` Collection

This collection stores user-configured rules that define what events trigger a notification.

**Shape: `AlertRule`**
```typescript
interface AlertRule {
  id: string;
  userId: string;
  alertType: 'BUDGET_THRESHOLD' | 'BILL_DUE' | 'GOAL_PROGRESS' | 'UNUSUAL_SPENDING';
  // For BUDGET_THRESHOLD
  budgetId?: string; 
  threshold?: number; // e.g., 80 for 80%
  // For BILL_DUE
  recurringTransactionId?: string;
  timing?: 'ON_DUE_DATE' | '1_DAY_BEFORE' | '3_DAYS_BEFORE' | '7_DAYS_BEFORE';
  // For GOAL_PROGRESS
  goalId?: string;
  // Common fields
  isEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2. `userNotificationPreferences` Collection

This collection stores individual user preferences for how and when they receive notifications.

**Shape: `UserNotificationPreference`**
```typescript
interface UserNotificationPreference {
  id: string; // Same as userId for a 1:1 relationship
  userId: string;
  channels: {
    email: { isEnabled: boolean; address: string; };
    push: { isEnabled: boolean; };
    inApp: { isEnabled: boolean; };
  };
  doNotDisturb: {
    isEnabled: boolean;
    startTime: string; // e.g., "22:00"
    endTime: string;   // e.g., "08:00"
  };
  updatedAt: Timestamp;
}
```

### 2.3. `notifications` Collection

This collection acts as a log for every notification generated and sent to a user. It is also the source for the in-app notification center.

**Shape: `Notification`**
```typescript
interface Notification {
  id: string;
  userId: string;
  alertRuleId: string; // Reference to the rule that triggered it
  content: {
    title: string;
    body: string;
  };
  status: 'sent' | 'delivered' | 'seen' | 'dismissed';
  isArchived: boolean;
  createdAt: Timestamp;
}
```

## 3. Alert Rules Engine

The core logic of the system resides in a backend process that evaluates alert rules. This will be implemented as a serverless function for scalability and ease of maintenance.

-   **Technology**: A scheduled **Cloud Function for Firebase**.
-   **Trigger**: The function will be triggered by **Cloud Scheduler** on a nightly basis (e.g., every day at 2 AM user's local time, if possible, or a fixed time like midnight UTC).
-   **Secondary Trigger**: For real-time alerts like "Unusual Spending," the engine can also be triggered by Firestore events on the `transactions` collection.

### Evaluation Flow:

1.  **Initiation**: The scheduled job invokes the `evaluateAlertRules` Cloud Function.
2.  **Fetch Rules**: The function queries all `alertRules` where `isEnabled` is `true`.
3.  **Iterate & Evaluate**: For each rule, the function performs the following based on `alertType`:
    *   **`BUDGET_THRESHOLD`**: Fetches the corresponding `Budget` and sums all `Transactions` for that category within the budget's month/year. It then calculates the percentage of the budget spent and compares it to the `threshold`.
    *   **`BILL_DUE`**: Fetches the `RecurringTransaction` and checks if its `nextDueDate` falls within the configured `timing` window (e.g., is 3 days from now).
    *   **`GOAL_PROGRESS`**: Fetches the `FinancialGoal` and evaluates progress against the `targetDate`. For example, it can alert if the user is less than 50% funded when 75% of the time has passed.
4.  **Notification Creation**: If a rule's conditions are met, the engine:
    *   Constructs a user-friendly message (e.g., "Heads up! You've used 85% of your 'Groceries' budget for July.").
    *   Creates a new document in the `notifications` collection with the content and a status of `sent`.
5.  **Fan-out for Delivery**: The creation of a new document in the `notifications` collection triggers the Multi-Channel Delivery System.

## 4. Multi-Channel Delivery System

This system is responsible for fanning out the generated notifications to the user's preferred channels. It will be implemented using separate, event-driven Cloud Functions that listen for new documents in the `notifications` collection.

-   **Trigger**: A Cloud Function (`onNotificationCreated`) listens to `onCreate` events on the `/notifications/{notificationId}` path.

### Delivery Flow:

1.  **Trigger**: A new notification document is created in Firestore.
2.  **Function Invocation**: The `onNotificationCreated` function is invoked with the new notification's data.
3.  **Fetch Preferences**: The function fetches the `UserNotificationPreference` for the `userId` associated with the notification.
4.  **Check Preferences & DND**: It checks the user's `channels` preferences and `doNotDisturb` settings.
5.  **Dispatch to Channels**: Based on the checks, the function dispatches the notification to the appropriate services:
    *   **Email**: If `channels.email.isEnabled` is true, it calls an email service like **SendGrid** or uses the **Trigger Email** Firebase Extension.
    *   **Push Notification**: If `channels.push.isEnabled` is true, it uses the **Firebase Cloud Messaging (FCM)** API to send a push notification to the user's registered devices.
    *   **In-App**: This is handled implicitly. The client application will have a real-time listener attached to the `notifications` collection for the logged-in user. New notifications will appear automatically in the UI.

## 5. Integration Points

The Alert System needs to read data from several existing application components.

-   **Budgets**: The engine needs to access `budgetAmount`, `category`, `month`, and `year` to evaluate budget threshold alerts.
-   **Transactions**: The engine needs to query transactions by `userId`, `category`, and `createdAt` to calculate the total spending for a given budget.
-   **Recurring Transactions**: The engine needs access to `nextDueDate` and `description` to generate reminders for upcoming bills.
-   **Goals**: The engine requires `targetAmount`, `currentAmount`, and `targetDate` to calculate progress and send motivational or "at-risk" alerts.
-   **Users**: The system needs the `userId` to associate all data correctly and fetch notification preferences.

## 6. Architecture Diagram

```mermaid
graph TD
    subgraph "Backend Processes (Cloud Functions)"
        Scheduler[Cloud Scheduler] -- Triggers nightly --> RulesEngine
        FirestoreEvents[Firestore Event: New Transaction] -- Triggers real-time --> RulesEngine
        
        RulesEngine[Alert Rules Engine] -- 1. Evaluates rules --> CreateNotification
        CreateNotification -- 2. Creates doc --> NotificationsCollection
        
        DeliveryFanOut[Delivery Fan-Out] -- 3. Listens for new docs --> NotificationsCollection
        DeliveryFanOut -- 4. Fetches --> UserPrefsCollection
        DeliveryFanOut -- 5. Dispatches to --> Channels
    end

    subgraph "Firestore Database"
        direction LR
        AlertRulesCollection[alertRules]
        UserPrefsCollection[userNotificationPreferences]
        NotificationsCollection[notifications]
        
        Budgets[Budgets]
        Transactions[Transactions]
        Recurring[Recurring Transactions]
        Goals[Goals]
    end

    subgraph "Delivery Channels"
        direction LR
        FCM[Firebase Cloud Messaging]
        SendGrid[Email Service]
        InApp[In-App UI Listener]
    end
    
    subgraph "Client Application"
        InApp -- Displays --> NotificationCenterUI[Notification Center]
    end

    RulesEngine -- Reads --> AlertRulesCollection
    RulesEngine -- Reads --> Budgets
    RulesEngine -- Reads --> Transactions
    RulesEngine -- Reads --> Recurring
    RulesEngine -- Reads --> Goals

    Channels -- Handled by --> FCM
    Channels -- Handled by --> SendGrid
    