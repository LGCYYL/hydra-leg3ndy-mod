# Walkthrough: Hiding Online UI Elements

This document outlines the changes made to the "Leg3ndy" application to hide online-centric UI elements, creating a more offline-focused experience.

## Summary of Changes

The following UI components and features have been hidden:

### 1. Sidebar (`src/renderer/src/components/sidebar/sidebar.tsx`)
- **Profile Section:** The user avatar, display name, and login prompt have been hidden.
- **"Need Help" Button:** The support chat button at the bottom of the sidebar has been hidden.

### 2. Settings
- **Account Tab (`src/renderer/src/pages/settings/settings.tsx`):** The "Account" tab is no longer displayed, even if a user is technically logged in.
- **Notifications (`src/renderer/src/pages/settings/settings-general.tsx`):** Social notifications (friend requests, achievements) have been hidden. Functional notifications (downloads, repacks) remain visible.
- **Steam Achievements (`src/renderer/src/pages/settings/settings-behavior.tsx`):** The toggle to enable/disable Steam achievements has been hidden.

### 3. Game Details
- **Cloud Save (`src/renderer/src/pages/game-details/game-details-content.tsx`):** The "Cloud Save" button in the hero section has been hidden.
- **Achievements Sidebar (`src/renderer/src/pages/game-details/sidebar/sidebar.tsx`):**
    - The "locked" achievements placeholder (shown when not logged in) has been hidden.
    - The "Achievements not syncing" warning button has been hidden.
    - The user's achievement progress is only shown if `achievements` data exists locally (which relies on the `achievements` array being populated), but the explicit "Login to see" prompts are gone.

## Technical Details

All changes were made by commenting out the relevant JSX code blocks. This allows for easy restoration of these features in the future if needed.

- **Unused Code Cleanup:** To maintain a clean codebase and avoid linting errors, unused imports (e.g., icons, hooks like `useUserDetails`) and variables were also commented out or removed where appropriate.

## Verification

- **Visual Check:** Navigate through the app. The sidebar should strictly show navigation items (Game Library, Downloads, Settings).
- **Settings Check:** The "Account" tab should be absent. General settings should not show notification options. Behavior settings should not show Steam achievement toggles.
- **Game Page Check:** No cloud icon/button. No "Sign in to see achievements" lock icon in the sidebar.
