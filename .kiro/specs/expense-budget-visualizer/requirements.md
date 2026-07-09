# Requirements Document

## Introduction

The Expense & Budget Visualizer is a single-page, mobile-friendly web application for tracking daily personal spending. Built with HTML, CSS, and Vanilla JavaScript, the app stores all data client-side using the browser's LocalStorage API. It provides users with an at-a-glance view of their total balance, a scrollable transaction history, and a visual chart breaking down spending by category. No installation, account, or backend is required — the app runs entirely in the browser and is usable as a standalone web page or browser extension.

## Glossary

- **App**: The Expense & Budget Visualizer single-page web application.
- **Transaction**: A recorded financial event with an amount, category, description, and date.
- **Balance**: The net sum computed from all income transactions minus all expense transactions.
- **Category**: A user-selected label grouping transactions (e.g., Food, Transport, Entertainment, Health, Other).
- **Transaction History**: The chronologically ordered list of all recorded transactions.
- **Chart**: A visual representation (e.g., pie or bar chart) showing the proportion or total of spending per category.
- **LocalStorage**: The browser's built-in key-value storage API used to persist transaction data client-side.
- **Income**: A transaction with a positive monetary value that increases the balance.
- **Expense**: A transaction with a negative monetary value that decreases the balance.

---

## Requirements

### Requirement 1 — Balance Display

**User Story:** As a user, I want to see my current total balance at a glance, so that I always know how much money I have available.

#### Acceptance Criteria

1. THE App SHALL display the current Balance prominently at the top of the page.
2. WHEN a new Transaction is added or deleted, THE App SHALL recalculate and update the displayed Balance immediately without a page reload.
3. THE App SHALL display the Balance with exactly two decimal places and a currency symbol (defaulting to USD "$").
4. WHILE the Balance is negative, THE App SHALL render the Balance value in a visually distinct color (e.g., red) to indicate an overdrawn state.

---

### Requirement 2 — Add Transaction

**User Story:** As a user, I want to add income and expense transactions, so that I can record my daily financial activity.

#### Acceptance Criteria

1. THE App SHALL provide an input form with the following fields: description (text), amount (numeric), category (select), type (Income or Expense), and date (defaults to today).
2. WHEN the user submits the add-transaction form, THE App SHALL validate that the description is non-empty and the amount is a positive numeric value greater than zero.
3. IF the user submits the form with an invalid or empty description or a non-positive amount, THEN THE App SHALL display an inline validation error message and prevent the Transaction from being saved.
4. WHEN a valid Transaction is submitted, THE App SHALL save the Transaction to LocalStorage and add it to the Transaction History immediately.
5. WHEN a valid Transaction is submitted, THE App SHALL reset the input form fields to their default state after saving.

---

### Requirement 3 — Transaction History

**User Story:** As a user, I want to view a list of all my past transactions, so that I can review my spending over time.

#### Acceptance Criteria

1. THE App SHALL display the Transaction History as a scrollable list showing each Transaction's description, amount, category, type, and date.
2. THE App SHALL display Expense transaction amounts with a negative sign and Income transaction amounts with a positive sign.
3. THE App SHALL render Expense and Income transactions in visually distinct styles (e.g., different text colors) to allow quick differentiation.
4. WHEN a Transaction is added or deleted, THE App SHALL update the Transaction History list immediately without a page reload.
5. THE App SHALL display transactions in reverse-chronological order (most recent first) by default.

---

### Requirement 4 — Delete Transaction

**User Story:** As a user, I want to delete individual transactions, so that I can correct mistakes in my records.

#### Acceptance Criteria

1. THE App SHALL display a delete control (e.g., button or icon) alongside each Transaction in the Transaction History.
2. WHEN the user activates the delete control for a Transaction, THE App SHALL remove that Transaction from LocalStorage and from the Transaction History list immediately.
3. WHEN a Transaction is deleted, THE App SHALL recalculate and update the Balance and Chart immediately.

---

### Requirement 5 — Spending Category Chart

**User Story:** As a user, I want to see a visual chart of my spending broken down by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL render a Chart on the main page visualizing total Expense amounts grouped by Category.
2. THE App SHALL label each segment or bar of the Chart with the Category name and its total amount or percentage.
3. WHEN Transactions are added or deleted, THE App SHALL update the Chart immediately to reflect the current data.
4. IF there are no Expense Transactions recorded, THEN THE App SHALL display a placeholder message (e.g., "No expense data to display") in the Chart area instead of rendering an empty chart.
5. THE App SHALL render the Chart using only Vanilla JavaScript and HTML Canvas or SVG, without external charting libraries.

---

### Requirement 6 — Data Persistence

**User Story:** As a user, I want my transactions to be saved between sessions, so that I don't lose my data when I close or refresh the browser.

#### Acceptance Criteria

1. WHEN a Transaction is added, THE App SHALL serialize and write the updated Transaction list to LocalStorage.
2. WHEN the App is loaded or reloaded, THE App SHALL read all previously stored Transactions from LocalStorage and restore the Transaction History, Balance, and Chart.
3. WHEN a Transaction is deleted, THE App SHALL update the LocalStorage entry to remove only that Transaction, leaving all other stored Transactions intact.
4. IF LocalStorage is unavailable or throws an access error, THEN THE App SHALL display a non-blocking warning message informing the user that data will not be persisted in the current session.

---

### Requirement 7 — Mobile-Friendly Responsive Layout

**User Story:** As a user, I want the app to work well on my phone, so that I can track expenses on the go.

#### Acceptance Criteria

1. THE App SHALL use a responsive single-column layout on viewports 480px wide or narrower, and a layout with up to two columns on viewports wider than 480px.
2. THE App SHALL render all interactive controls (buttons, inputs, selects) at a minimum touch target size of 44×44 CSS pixels.
3. THE App SHALL scale fonts and spacing using relative units (rem or em) so that content remains readable when the browser's default font size is changed.
4. THE App SHALL be fully usable without horizontal scrolling on a viewport as narrow as 320px.

---

### Requirement 8 — Single-Page Application Structure

**User Story:** As a user, I want a fast, simple app with no installation required, so that I can start using it immediately.

#### Acceptance Criteria

1. THE App SHALL be delivered as a single HTML file that includes or references all required CSS and JavaScript inline or via relative paths, requiring no build step or server to run.
2. THE App SHALL load and render the initial view in under 2 seconds on a standard broadband connection.
3. THE App SHALL function correctly when opened directly from the file system (using the `file://` protocol) without a web server.
4. WHERE the App is used as a browser extension, THE App SHALL follow the same single-file structure and operate within browser extension content security constraints.

---

### Requirement 9 — Category Filter

**User Story:** As a user, I want to filter the transaction history by category, so that I can focus on a specific spending area.

#### Acceptance Criteria

1. THE App SHALL provide a filter control (e.g., dropdown or tab) that allows the user to select a Category or view all Transactions.
2. WHEN the user selects a Category from the filter control, THE App SHALL display only Transactions belonging to that Category in the Transaction History list.
3. WHEN the user selects "All" from the filter control, THE App SHALL display all Transactions in the Transaction History list.
4. WHEN the filter is active, THE App SHALL keep the Balance display and Chart reflecting all Transactions regardless of the active filter.

---

### Requirement 10 — Clear All Data

**User Story:** As a user, I want to be able to reset all my data, so that I can start fresh without manual deletion.

#### Acceptance Criteria

1. THE App SHALL provide a "Clear All" control that allows the user to delete all stored Transactions at once.
2. WHEN the user activates the "Clear All" control, THE App SHALL display a confirmation prompt before proceeding.
3. WHEN the user confirms the clear action, THE App SHALL remove all Transactions from LocalStorage and reset the Transaction History, Balance, and Chart to their empty/initial states.
4. WHEN the user cancels the clear action, THE App SHALL take no action and leave all existing data unchanged.
