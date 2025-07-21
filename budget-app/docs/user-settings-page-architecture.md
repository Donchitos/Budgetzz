# User/Settings Page Architecture

This document outlines the architecture for the new User/Settings page, which will replace the existing Dashboard.

## 1. Page Structure

The User/Settings page will be a single, well-organized page with the following sections:

*   **User Profile:** Displays user information (email, name) and provides an option to log out. In the future, this section can be expanded to include profile picture uploads and password changes.
*   **Application Preferences:** Allows users to customize their experience, such as setting the default landing page after login.
*   **Notification Settings:** Consolidates all notification-related preferences, allowing users to toggle different types of alerts (e.g., budget overspending, upcoming bills).

## 2. Component Migration

The following components from the `features/dashboard` directory will be repurposed:

*   **`DashboardHeader.tsx`:** The user's email and the logout functionality will be extracted and moved into a new `UserProfile` component on the Settings page. The rest of the header will be discarded.
*   **`BalanceOverview.tsx`, `FinancialInsights.tsx`, `QuickActions.tsx`:** These components are dashboard-specific and will be removed. Their functionalities are not directly transferable to the User/Settings page's scope.

## 3. New Components

The following new components will be created within a new `features/settings` directory:

*   **`SettingsPage.tsx`:** The main container for the User/Settings page, which will assemble the various sections.
*   **`UserProfile.tsx`:** A component to display the user's email and a logout button. It will source this data from the auth context.
*   **`AppPreferences.tsx`:** A component containing UI elements for application-wide settings, such as a dropdown to select the default page.
*   **`NotificationPreferences.tsx`:** This will reuse and enhance the existing `features/alerts/NotificationPreferences.tsx` to provide a more comprehensive set of notification controls.

## 4. Routing and Navigation

### Routing (`App.tsx`)

1.  **Remove Dashboard Route:** The following route will be deleted:
    ```tsx
    <Route path="/dashboard" element={user ? <Dashboard selectedPeriod={selectedPeriod} setSelectedPeriod={setSelectedPeriod} /> : <Navigate to="/" />} />
    ```
2.  **Add Settings Route:** A new route for the settings page will be added:
    ```tsx
    const SettingsPage = lazy(() => import('./features/settings/SettingsPage'));
    // ...
    <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/" />} />
    ```
3.  **Update Redirects:** The root path and registration redirects will be updated to point to a more suitable default page, such as `/transactions`:
    ```tsx
    <Route path="/" element={!user ? <Login /> : <Navigate to="/transactions" />} />
    <Route path="/register" element={!user ? <Register /> : <Navigate to="/transactions" />} />
    ```

### Navigation (`components/Navigation.tsx`)

1.  **Remove Overview Link:** The "Overview" link pointing to the dashboard will be removed:
    ```tsx
    <NavLink to="/dashboard" end>Overview</NavLink>
    ```
2.  **Update Logo Link:** The main logo link will be updated to point to the new default page:
    ```tsx
    <NavLink to="/transactions">BudgetApp</NavLink>
    ```
3.  **Add Settings Link:** A new link or user icon will be added to the user section of the navigation bar, pointing to the `/settings` page. For example:
    ```tsx
    <div className="nav-user">
      <NotificationBell />
      <NavLink to="/settings">Settings</NavLink>
      {/* Or an icon-based link */}
    </div>
    ```

## 5. File Removal

Once the new User/Settings page is implemented and the dashboard is no longer in use, the following files and directories can be safely deleted:

*   `budget-app/src/features/dashboard/` (entire directory)