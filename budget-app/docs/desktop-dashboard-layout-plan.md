# Desktop Dashboard Layout Plan

This document outlines a new multi-column layout for the application's dashboard, designed to optimize screen space on desktop devices and provide a more intuitive user experience.

## Layout Structure

The new design will feature a main header that spans the full width of the dashboard, followed by a three-column layout for the main content.

- **`DashboardHeader`**: Positioned at the top, spanning all columns. It will contain the main greeting and user information.

---

### Left Column: Core Financials & Actions

This column is dedicated to the most critical, at-a-glance financial information and primary user actions.

*   **`BalanceOverview`**: The user's current financial standing is the most important piece of information and is placed prominently for immediate visibility.
*   **`QuickActions`**: Provides immediate access to the most common tasks (e.g., "Add Transaction," "Transfer Funds"), streamlining user workflows.
*   **`UpcomingBills`**: Alerts the user to upcoming financial commitments, helping with short-term planning.

### Center Column: Spending Analysis & Transactions

This column focuses on detailed transactional data and spending patterns, allowing users to understand where their money is going.

*   **`RecentTransactions`**: A list of the latest transactions provides an immediate overview of account activity.
*   **`CategorySpending`**: A visual breakdown (e.g., pie chart or bar graph) of spending by category helps users quickly identify their main areas of expenditure.

### Right Column: Future & Goals

This column is forward-looking, providing insights, projections, and progress towards long-term financial goals.

*   **`FutureBalanceProjection`**: This predictive chart is a key feature for financial planning and is given a prominent position.
*   **`GoalsSummaryWidget`**: Keeps financial goals top-of-mind and allows users to track their progress.
*   **`FinancialInsights`**: Contains the "Smart Tip," offering contextual advice. This is a valuable but less critical piece of information, making it suitable for the right-most column.

## Rationale

This three-column layout provides a clear, organized, and balanced view of the user's financial landscape.

*   **Logical Grouping**: Components are grouped by their function: core status on the left, detailed activity in the center, and forward-looking information on the right.
*   **Improved Scan-ability**: Users can quickly scan the dashboard to get the information they need without excessive scrolling.
*   **Scalability**: The column-based layout can adapt more gracefully to different screen sizes and can accommodate new widgets in the future without breaking the overall design.