# New Dashboard Design

This document outlines the design and architecture for the redesigned dashboard.

## 1. High-Level Overview

The new dashboard will be a clean, intuitive interface focused on providing users with a clear overview of their financial health at a glance. The layout will be simplified, using a card-based design to organize information into logical sections.

## 2. Key Widgets and Placement

The dashboard will be structured with the following key widgets:

*   **Balance Overview:** A prominent card at the top of the page displaying the current balance, with a clear indicator of financial health (e.g., using color-coding).
*   **Quick Actions:** A set of buttons for common actions like adding an expense or income, making it easy for users to perform frequent tasks.
*   **Spending Breakdown:** A bar chart visualizing spending by category, providing a clear comparison of where money is going.
*   **Cash Flow Sankey Diagram:** A Sankey diagram to illustrate the flow of money between income and expenses, offering a more intuitive understanding of cash flow than a simple list of transactions.
*   **Upcoming Bills:** A timeline view of upcoming bills and recurring payments to help users stay on top of their finances.
*   **Spending Trends:** A chart showing spending trends over time to provide insights into financial habits.

## 3. Component Structure

The new dashboard will be built with the following React components:

*   `Dashboard.tsx`: The main container for the dashboard page.
*   `BalanceOverview.tsx`: A new component to display the current balance and financial health status.
*   `QuickActions.tsx`: A component containing buttons for frequent user actions.
*   `SpendingBreakdown.tsx`: A component to render the spending breakdown bar chart.
*   `CashFlowSankey.tsx`: A new component to display the cash flow Sankey diagram.
*   `UpcomingBills.tsx`: A new component to display the upcoming bills timeline.
*   `SpendingTrends.tsx`: A new component to display the spending trends chart.
*   `DashboardCard.tsx`: A reusable card component for consistent styling of dashboard widgets.

## 4. Color-Coding and Typography

*   **Color-Coding:**
    *   **Green:** Positive financial status (e.g., on track with budget, positive cash flow).
    *   **Yellow:** A warning or neutral status (e.g., approaching budget limits).
    *   **Red:** A negative or critical status (e.g., over budget, negative cash flow).
*   **Typography:**
    *   Use a clean, modern font (e.g., Inter, Lato) for readability.
    *   Maintain a clear visual hierarchy with distinct font sizes and weights for headings, subheadings, and body text.

## 5. Messaging

The language used throughout the dashboard will be simple, friendly, and encouraging. Avoid financial jargon and use plain, human-centered language to make the information accessible to all users.