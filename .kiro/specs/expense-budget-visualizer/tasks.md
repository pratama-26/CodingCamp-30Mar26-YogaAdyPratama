# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a flat-file, client-side expense tracker using vanilla HTML/CSS/JS with Chart.js via CDN and localStorage persistence. No build tools or frameworks. All logic lives in `js/app.js` wrapped in an IIFE.

## Tasks

- [x] 1. Scaffold project files
  - Create `index.html` with CDN links for Chart.js and a link to `css/styles.css` and `js/app.js`
  - Create empty `css/styles.css`
  - Create empty `js/app.js` with an IIFE wrapper and a `DOMContentLoaded` listener that calls `init()`
  - _Requirements: 1.1, 5.3_

- [x] 2. Build HTML structure
  - [x] 2.1 Add all required elements and IDs to `index.html`
    - `<header>` with `#total-balance` span
    - `#storage-warning` banner (hidden by default)
    - `#expense-form` with `#input-name`, `#input-amount`, `#input-category` (Food/Transport/Fun options), submit button, and `#form-error` span
    - `#list-section` containing `#empty-state` paragraph and `#transaction-list` `<ul>`
    - `#chart-section` containing `#chart-canvas` `<canvas>`
    - _Requirements: 1.1, 2.3, 6.3_

- [x] 3. Implement CSS styling
  - [x] 3.1 Write base layout and typography in `css/styles.css`
    - Page layout: centered max-width container, header, main sections stacked
    - Form layout: inline/grid fields with submit button
    - _Requirements: 1.1_
  - [x] 3.2 Style transaction list, empty state, and chart section
    - List items with name, amount, category, and delete button laid out clearly
    - Responsive adjustments for narrow viewports
    - Hide `#storage-warning` and `#form-error` by default (show via `.visible` class or `display` toggle)
    - Include responsive design for mobile devices
    - _Requirements: 2.2, 2.3, 6.3_

- [x] 4. Implement localStorage helpers in `js/app.js`
  - [x] 4.1 Write `isStorageAvailable()`, `loadFromStorage()`, and `saveToStorage()`
    - `isStorageAvailable()`: try/catch write+delete test, returns boolean
    - `loadFromStorage()`: reads `"expense-visualizer-transactions"`, wraps `JSON.parse` in try/catch, falls back to `[]` on failure and logs a console warning
    - `saveToStorage()`: serializes `transactions` array to the same key; no-ops if storage unavailable
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Implement transaction mutation functions
  - [x] 5.1 Write `validateForm(name, amount, category)`
    - Returns an error string if name is empty/whitespace, amount is not a positive number, or category is not one of Food/Transport/Fun
    - Returns `null` when all inputs are valid
    - _Requirements: 1.3_
  - [x] 5.2 Write `addTransaction(name, amount, category)`
    - Calls `validateForm`; if invalid, sets `#form-error` text and returns early
    - Generates id via `crypto.randomUUID()` with fallback to `Date.now().toString() + Math.random()`
    - Pushes new transaction object onto `transactions`, calls `saveToStorage()`, clears form fields, hides `#form-error`, calls `render()`
    - _Requirements: 1.2, 1.3, 1.4_
  - [x] 5.3 Write `deleteTransaction(id)`
    - Filters `transactions` by id, calls `saveToStorage()`, calls `render()`
    - _Requirements: 3.2, 3.3_

- [x] 6. Implement render functions
  - [x] 6.1 Write `renderTotal()`
    - Sums all `transactions[].amount`, formats to two decimal places, sets `#total-balance` text content
    - _Requirements: 4.1, 4.2_
  - [x] 6.2 Write `renderList()`
    - Clears `#transaction-list`, toggles `#empty-state` visibility based on array length
    - For each transaction, creates an `<li>` with name, formatted amount, category text, and a delete `<button>` whose click handler calls `deleteTransaction(id)`
    - _Requirements: 2.1, 2.2, 2.3, 3.1_
  - [x] 6.3 Write `renderChart()`
    - Aggregates `transactions` into `{ Food: n, Transport: n, Fun: n }` sums
    - If `window.Chart` is undefined, hides `#chart-section` and returns early
    - If `chartInstance` exists, updates `data.labels`, `data.datasets[0].data`, and calls `chartInstance.update()`
    - Otherwise creates a new `Chart` instance on `#chart-canvas` (type `'pie'`) and stores it in the module-level `chartInstance` variable
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 6.4 Write `render()`
    - Calls `renderList()`, `renderTotal()`, `renderChart()` in sequence
    - _Requirements: 1.2, 3.3, 4.2, 5.2_

- [x] 7. Implement `init()` and wire everything together
  - [x] 7.1 Write `init()`
    - Calls `isStorageAvailable()`; if false, shows `#storage-warning`
    - Calls `loadFromStorage()` and assigns result to `transactions`
    - Attaches `submit` listener on `#expense-form` that calls `addTransaction` with trimmed field values and prevents default
    - Calls `render()`
    - _Requirements: 1.2, 6.1, 6.2, 6.3_

- [x] 8. Checkpoint — verify full flow manually
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add remaining error handling
  - [x] 9.1 Confirm Chart.js CDN failure path in `renderChart()`
    - Verify `window.Chart` guard hides `#chart-section` so the rest of the app remains functional
    - _Requirements: 5.3_
  - [x] 9.2 Confirm corrupted localStorage path in `loadFromStorage()`
    - Verify try/catch falls back to `[]` and logs a console warning without throwing
    - _Requirements: 6.1_

- [ ] 10. Final checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The `chartInstance` module-level variable is created once in `init()` and updated in-place on every `renderChart()` call to avoid destroy/recreate overhead
