# UI Refactor Plan

This document outlines the plan for refactoring the application's UI and styling.

## 1. Color Palette

The new color scheme will be defined in `src/variables.css`. The following is a proposed palette:

*   **Primary:** `#2C3E50` (Midnight Blue)
*   **Secondary:** `#3498DB` (Peter River Blue)
*   **Accent:** `#E74C3C` (Alizarin Crimson)
*   **Background:** `#ECF0F1` (Clouds)
*   **Text:** `#34495E` (Wet Asphalt)

## 2. Dashboard Layout

The dashboard will be redesigned to provide a more intuitive and visually appealing user experience. The new layout will be implemented in a new `Dashboard.tsx` component and will feature the following sections:

*   **Header:** A new header component will be created to display the user's name, a notification bell, and a settings icon.
*   **Main Content:** The main content area will be a grid-based layout that allows for flexible arrangement of widgets.
*   **Sidebar:** A collapsible sidebar will provide navigation to other sections of the application.

## 3. Data Visualization

The following charts will be used to visualize financial data:

*   **Balance Overview:** A line chart will display the user's balance over time.
*   **Expense Breakdown:** A donut chart will show the distribution of expenses by category.
*   **Income vs. Expense:** A bar chart will compare income and expenses for the current month.

## 4. Typography

The following typography changes will be made to improve readability:

*   **Font:** The primary font will be changed to a modern, sans-serif font like Lato or Roboto.
*   **Font Size:** The base font size will be increased to 16px.
*   **Line Height:** The line height will be adjusted to improve readability.

## 5. Component Styling

The following components will be restyled to match the new design:

*   `Card.tsx`
*   `Button.tsx`
*   `Input.tsx`
*   `Navigation.tsx`
*   `TransactionList.tsx`
## 6. Gamification Elements

*   **Progress Bars:** To visually track progress towards savings goals and debt payoff plans, we will introduce progress bars. These should be displayed prominently on the dashboard and within the goals section.
*   **Badges:** Users will earn badges for achieving milestones, such as paying off a debt, reaching a savings goal, or maintaining a budget for a certain period.
*   **Points System:** Introduce a points system to reward positive financial behaviors, like categorizing transactions promptly or staying under budget.