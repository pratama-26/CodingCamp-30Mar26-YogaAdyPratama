# Requirements Document

## Introduction

The Expense & Budget Visualizer is a client-side web application that allows users to track personal expenses and visualize spending by category through a pie chart. All data is stored in the browser's Local Storage. The app requires no backend, no login, and no setup — just open and use. It is built with vanilla HTML, CSS, and JavaScript only, using a single CSS file and a single JS file.

## Glossary

- **App**: The Expense & Budget Visualizer web application
- **Transaction**: A single spending record with a name, amount, and category
- **Category**: A fixed label used to group transactions — one of: Food, Transport, Fun
- **Transaction_List**: The scrollable list of all recorded transactions
- **Chart**: A pie chart showing spending distribution by category
- **Local_Storage**: The browser's built-in client-side key-value storage API

---

## Requirements

### Requirement 1: Add a Transaction

**User Story:** As a user, I want to add a new transaction with a name, amount, and category, so that I can record my spending.

#### Acceptance Criteria

1. THE App SHALL provide a form with fields for item name (text), amount (number), and category (select with options: Food, Transport, Fun)
2. WHEN the user submits the form with all fields filled, THE App SHALL save the transaction to Local_Storage and display it in the Transaction_List
3. IF the user submits the form with any field empty, THEN THE App SHALL display a validation error and prevent saving
4. WHEN a transaction is saved, THE App SHALL clear the form fields and return them to their default state

---

### Requirement 2: View Transactions

**User Story:** As a user, I want to see all my recorded transactions in a scrollable list, so that I can review my spending.

#### Acceptance Criteria

1. THE App SHALL display all saved transactions in the Transaction_List
2. THE Transaction_List SHALL show the name, amount, and category for each transaction
3. WHEN no transactions have been recorded, THE App SHALL display an empty-state message in the Transaction_List

---

### Requirement 3: Delete a Transaction

**User Story:** As a user, I want to delete a transaction, so that I can remove incorrect or duplicate entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL display a delete control for each transaction entry
2. WHEN the user activates the delete control for a transaction, THE App SHALL remove that transaction from Local_Storage and from the Transaction_List without requiring a page reload
3. WHEN a transaction is deleted, THE App SHALL update the total balance and Chart to reflect the removal

---

### Requirement 4: Display Total Balance

**User Story:** As a user, I want to see the total of all my transactions at a glance, so that I know my overall spending.

#### Acceptance Criteria

1. THE App SHALL display the sum of all transaction amounts at the top of the page
2. WHEN a transaction is added or deleted, THE App SHALL automatically update the displayed total balance

---

### Requirement 5: Visualize Spending by Category

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going.

#### Acceptance Criteria

1. THE App SHALL display a Chart showing the spending distribution across the Food, Transport, and Fun categories
2. WHEN a transaction is added or deleted, THE App SHALL automatically update the Chart to reflect the current data
3. WHERE a charting library is used, THE App SHALL use Chart.js or an equivalent lightweight library loaded via CDN

---

### Requirement 6: Persist Data Across Sessions

**User Story:** As a user, I want my transactions to be saved between browser sessions, so that I don't lose my data when I close the tab.

#### Acceptance Criteria

1. THE App SHALL read all transactions from Local_Storage on page load
2. WHEN the page is loaded with existing data in Local_Storage, THE App SHALL render the Transaction_List, total balance, and Chart without requiring any user action
3. IF Local_Storage is unavailable, THEN THE App SHALL display a warning message informing the user that data cannot be saved
