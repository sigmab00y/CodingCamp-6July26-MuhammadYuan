# Implementation Plan: Expense & Budget Visualizer

## Overview

Implement a zero-dependency, single-file (`index.html`) web application using HTML, CSS, and Vanilla JavaScript. The app follows an MVC-lite event-driven architecture with `StorageService`, `TransactionModel`, `ChartRenderer`, `UIRenderer`, and `App` controller modules — all contained within one file. Data persists via `localStorage`.

## Tasks

- [ ] 1. Set up the single HTML file skeleton and CSS foundation
  - Create `index.html` with semantic HTML structure: balance section, add-transaction form, category filter, transaction history list, and canvas chart area
  - Add `<style>` block with CSS custom properties (color palette, spacing), reset styles, and responsive layout using `@media (max-width: 480px)`
  - Implement two-column desktop layout and single-column mobile layout using CSS Grid or Flexbox
  - Use `rem`/`em` units for all fonts and spacing; set minimum touch target size of 44×44 CSS pixels for all interactive controls
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.1, 8.3_

- [ ] 2. Implement StorageService and TransactionModel
  - [ ] 2.1 Implement `StorageService` with `load()`, `save()`, and `isAvailable()` methods
    - Wrap all `localStorage` calls in try/catch; return safe defaults on failure
    - Set `STORAGE_KEY = 'ebv_transactions'`
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 2.2 Write property test for StorageService persistence round-trip
    - **Property 5: Persistence Round-Trip**
    - **Validates: Requirements 2.4, 6.1, 6.2**

  - [ ] 2.3 Implement `TransactionModel` with `init()`, `add()`, `remove()`, `clearAll()`, `getBalance()`, `getFilteredTransactions()`, `getCategoryTotals()`, and `setFilter()`
    - Transaction shape: `{ id, description, amount, category, type, date, createdAt }`
    - Use `crypto.randomUUID()` with `Date.now() + Math.random()` fallback for `id`
    - Balance: `Σ(income.amount) − Σ(expense.amount)`
    - Sort transactions descending by `date`, then by `createdAt` for same-day ties
    - `getCategoryTotals()` must aggregate only Expense transactions per category
    - _Requirements: 1.2, 3.5, 4.2, 5.1, 6.1, 6.3, 9.2, 9.3, 10.3_

  - [ ]* 2.4 Write property test for balance calculation correctness
    - **Property 1: Balance Calculation Correctness**
    - **Validates: Requirements 1.2, 4.3**

  - [ ]* 2.5 Write property test for surgical delete
    - **Property 6: Surgical Delete**
    - **Validates: Requirements 4.2, 6.3**

  - [ ]* 2.6 Write property test for category chart aggregation
    - **Property 10: Category Chart Aggregation**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 2.7 Write property test for category filter correctness
    - **Property 11: Category Filter Correctness**
    - **Validates: Requirements 9.2, 9.3**

  - [ ]* 2.8 Write property test for filter not affecting balance or chart
    - **Property 12: Filter Does Not Affect Balance or Chart**
    - **Validates: Requirements 9.4**

  - [ ]* 2.9 Write property test for reverse-chronological ordering
    - **Property 9: Reverse-Chronological Ordering**
    - **Validates: Requirements 3.5**

- [ ] 3. Implement form validation logic
  - [ ] 3.1 Implement the validation function that checks description (non-empty after trim) and amount (finite number > 0)
    - Return structured error result per field when invalid
    - _Requirements: 2.2, 2.3_

  - [ ]* 3.2 Write property test for transaction validation
    - **Property 4: Transaction Validation**
    - **Validates: Requirements 2.2, 2.3**

- [ ] 4. Checkpoint — Core logic complete
  - Ensure `StorageService`, `TransactionModel`, and validation logic work correctly end-to-end. Ask the user if questions arise.

- [ ] 5. Implement UIRenderer
  - [ ] 5.1 Implement `renderBalance(balance)` — update balance text with two decimal places and `$` prefix; apply/remove negative CSS class
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ]* 5.2 Write property test for balance formatting
    - **Property 2: Balance Formatting**
    - **Validates: Requirements 1.3**

  - [ ]* 5.3 Write property test for negative balance indicator
    - **Property 3: Negative Balance Indicator**
    - **Validates: Requirements 1.4**

  - [ ] 5.4 Implement `renderTransactionList(transactions, onDelete)` — rebuild the transaction list DOM; show description, amount (signed), category, type, date; apply `transaction-item--expense` / `transaction-item--income` CSS classes; include a delete button per item
    - Use the HTML structure from the design: `<li class="transaction-item ...">` with `.transaction-info` and `.transaction-right` sub-divs
    - Show an empty-state message when the list is empty
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1_

  - [ ]* 5.5 Write property test for transaction list sign convention
    - **Property 7: Transaction List Sign Convention**
    - **Validates: Requirements 3.2**

  - [ ]* 5.6 Write property test for transaction list type styling
    - **Property 8: Transaction List Type Styling**
    - **Validates: Requirements 3.3**

  - [ ]* 5.7 Write property test for delete controls present for all transactions
    - **Property 15: Delete Controls Present for All Transactions**
    - **Validates: Requirements 4.1**

  - [ ] 5.8 Implement `resetForm()`, `showError(fieldId, message)`, `clearErrors()`, `showStorageWarning()`, and `renderFilterOptions(categories)`
    - `resetForm()` resets all form fields to their default values (date defaults to today)
    - `showError` / `clearErrors` manage inline validation error elements per field
    - `showStorageWarning` renders a non-blocking warning banner
    - `renderFilterOptions` populates the category filter dropdown including an "All" option
    - _Requirements: 2.1, 2.3, 2.5, 6.4, 9.1_

- [ ] 6. Implement ChartRenderer
  - [ ] 6.1 Implement `ChartRenderer.init(canvasElement)` to obtain the 2D canvas context; handle unavailable context gracefully by hiding the chart area
    - _Requirements: 5.5, 8.1_

  - [ ] 6.2 Implement `ChartRenderer.render(categoryTotals)` to draw a pie chart using the Canvas 2D API
    - Use fixed category color palette: Food `#FF6B6B`, Transport `#4ECDC4`, Entertainment `#45B7D1`, Health `#96CEB4`, Other `#FFEAA7`
    - Label each slice with category name and percentage
    - _Requirements: 5.1, 5.2, 5.5_

  - [ ] 6.3 Implement `ChartRenderer.renderEmpty()` to display "No expense data to display" centered in the canvas
    - _Requirements: 5.4_

- [ ] 7. Implement App controller and wire everything together
  - [ ] 7.1 Implement `App.init()` — call `TransactionModel.init()`, check storage availability, bind all DOM event listeners, and call `_refresh()` for the initial render
    - _Requirements: 6.2, 6.4, 8.2_

  - [ ] 7.2 Implement `App._refresh()` — call `UIRenderer.renderBalance()`, `UIRenderer.renderTransactionList()`, and `ChartRenderer.render()` / `ChartRenderer.renderEmpty()` based on current model state
    - _Requirements: 1.2, 3.4, 4.3, 5.3_

  - [ ] 7.3 Implement `App._onAddTransaction(event)` — validate form input, call `TransactionModel.add()`, call `UIRenderer.resetForm()`, call `_refresh()`
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [ ] 7.4 Implement `App._onDeleteTransaction(id)` — call `TransactionModel.remove(id)`, call `_refresh()`
    - _Requirements: 4.2, 4.3_

  - [ ] 7.5 Implement `App._onClearAll()` — show native `confirm()` dialog; on confirm call `TransactionModel.clearAll()` and `_refresh()`; on cancel do nothing
    - _Requirements: 10.2, 10.3, 10.4_

  - [ ] 7.6 Implement `App._onFilterChange(category)` — call `TransactionModel.setFilter(category)` and re-render only the transaction list (balance and chart remain unaffected)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 7.7 Write property test for clear all resets state
    - **Property 13: Clear All Resets State**
    - **Validates: Requirements 10.3**

  - [ ]* 7.8 Write property test for cancel clear preserves state
    - **Property 14: Cancel Clear Preserves State**
    - **Validates: Requirements 10.4**

- [ ] 8. Final checkpoint — Full integration verification
  - Ensure all features work end-to-end: add transaction, delete transaction, filter by category, clear all, chart rendering, balance updates, and localStorage persistence across page reloads. Ensure all tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- The entire app lives in a single `index.html` file — no build step, no dependencies
- All property tests reference specific design properties and requirements for traceability
- Checkpoints ensure incremental validation at logical milestones
- The responsive layout breakpoint is `480px` — single column at or below, two columns above

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.3", "2.2", "3.2"] },
    { "id": 3, "tasks": ["2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "5.1", "5.4", "5.8", "6.1"] },
    { "id": 4, "tasks": ["5.2", "5.3", "5.5", "5.6", "5.7", "6.2", "6.3"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 7, "tasks": ["7.7", "7.8"] }
  ]
}
```
