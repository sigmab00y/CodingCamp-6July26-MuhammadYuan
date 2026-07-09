# Design Document

## Expense & Budget Visualizer

---

## Overview

The Expense & Budget Visualizer is a zero-dependency, single-file web application written in HTML, CSS, and Vanilla JavaScript. All application logic runs in the browser; there is no backend, build step, or external dependency. Data is persisted to `localStorage`. The app is usable as a standalone `file://` web page or as a browser extension popup.

---

## Architecture

The application follows a **MVC-lite event-driven architecture** contained within a single HTML file:

```
index.html
├── <style>   — All CSS (variables, reset, layout, components, responsive)
├── <body>    — Semantic HTML markup
└── <script>  — All JavaScript (model, view, controller)
    ├── StorageService   — LocalStorage read/write abstraction
    ├── TransactionModel — Data model and business logic
    ├── ChartRenderer    — Canvas pie-chart drawing
    ├── UIRenderer       — DOM manipulation / view layer
    └── App              — Controller: wires events to model + view
```

Data flows in one direction:

```
User Interaction → App (Controller)
                 → TransactionModel (mutates data)
                 → StorageService (persists data)
                 → UIRenderer (re-renders view)
                 → ChartRenderer (re-renders chart)
```

All state lives in `TransactionModel`. The view layer is stateless and purely derived from the model on each re-render.

---

## Components

### 1. StorageService

Provides a safe wrapper over `localStorage` with graceful degradation.

```javascript
const StorageService = {
  STORAGE_KEY: 'ebv_transactions',

  // Returns array of Transaction objects, or [] on failure
  load() { ... },

  // Saves array of Transaction objects; returns boolean success
  save(transactions) { ... },

  // Returns false and triggers warning if localStorage is unavailable
  isAvailable() { ... }
};
```

Errors are caught internally; if `localStorage` throws, the service returns safe defaults and sets a flag that causes `UIRenderer` to show a non-blocking storage-unavailable warning.

---

### 2. TransactionModel

Holds all in-memory application state. All mutations go through this module.

```javascript
const TransactionModel = {
  transactions: [],   // Array<Transaction>
  activeFilter: 'All', // string — selected category filter

  // Load from storage
  init() { ... },

  // Add a new transaction; returns the created Transaction object
  add(description, amount, category, type, date) { ... },

  // Remove a transaction by id; returns boolean
  remove(id) { ... },

  // Replace all transactions with [] and persist
  clearAll() { ... },

  // Derived values (pure, no side effects)
  getBalance() { ... },          // number
  getFilteredTransactions() { ... },  // Array<Transaction>
  getCategoryTotals() { ... },   // Array<{ category, total }>
  setFilter(category) { ... },
};
```

**Transaction shape:**

```javascript
{
  id: string,          // crypto.randomUUID() or Date.now() fallback
  description: string,
  amount: number,      // always positive; type determines sign
  category: string,    // 'Food' | 'Transport' | 'Entertainment' | 'Health' | 'Other'
  type: string,        // 'Income' | 'Expense'
  date: string,        // ISO 8601 date string 'YYYY-MM-DD'
  createdAt: number    // timestamp for stable sort
}
```

**Balance calculation:**

```
balance = Σ(income.amount) − Σ(expense.amount)
```

**Sorting:** Transactions are sorted descending by `date` first, then by `createdAt` for same-day entries.

---

### 3. ChartRenderer

Draws a pie chart on a `<canvas>` element using only the 2D Canvas API. No external libraries.

```javascript
const ChartRenderer = {
  canvas: null,
  ctx: null,

  init(canvasElement) { ... },

  // categoryTotals: Array<{ category: string, total: number }>
  render(categoryTotals) { ... },

  // Draws "No expense data to display" centered in the canvas
  renderEmpty() { ... },

  // Draws one pie slice + legend label
  _drawSlice(startAngle, endAngle, color, label, percentage) { ... },
};
```

Color palette — one fixed color per category:

| Category      | Color   |
|---------------|---------|
| Food          | #FF6B6B |
| Transport     | #4ECDC4 |
| Entertainment | #45B7D1 |
| Health        | #96CEB4 |
| Other         | #FFEAA7 |

---

### 4. UIRenderer

All DOM manipulation lives here. Functions accept data objects and mutate the DOM.

```javascript
const UIRenderer = {
  // Update balance display (text + CSS class for negative state)
  renderBalance(balance) { ... },

  // Rebuild the transaction list from an array; handles empty state
  renderTransactionList(transactions, onDelete) { ... },

  // Reset form fields to defaults
  resetForm() { ... },

  // Show / clear inline validation error messages
  showError(fieldId, message) { ... },
  clearErrors() { ... },

  // Show/hide the localStorage unavailable warning banner
  showStorageWarning() { ... },

  // Populate the category filter dropdown with available categories
  renderFilterOptions(categories) { ... },
};
```

**Transaction list item HTML structure:**

```html
<li class="transaction-item transaction-item--expense" data-id="...">
  <div class="transaction-info">
    <span class="transaction-description">Coffee</span>
    <span class="transaction-meta">Food · 2025-07-06</span>
  </div>
  <div class="transaction-right">
    <span class="transaction-amount transaction-amount--expense">-$4.50</span>
    <button class="btn-delete" aria-label="Delete transaction">×</button>
  </div>
</li>
```

---

### 5. App (Controller)

Wires DOM events to model mutations and triggers re-renders.

```javascript
const App = {
  init() {
    TransactionModel.init();
    // Check storage availability; show warning if unavailable
    // Bind all event listeners
    // Initial full render
  },

  // Called after every state mutation
  _refresh() {
    UIRenderer.renderBalance(TransactionModel.getBalance());
    UIRenderer.renderTransactionList(
      TransactionModel.getFilteredTransactions(),
      (id) => App._onDeleteTransaction(id)
    );
    const totals = TransactionModel.getCategoryTotals();
    totals.length > 0
      ? ChartRenderer.render(totals)
      : ChartRenderer.renderEmpty();
  },

  _onAddTransaction(event) { ... },     // validates, calls model.add()
  _onDeleteTransaction(id) { ... },     // calls model.remove()
  _onClearAll() { ... },                // shows confirm, calls model.clearAll()
  _onFilterChange(category) { ... },    // calls model.setFilter(), re-renders list only
};
```

---

## UI Layout

### Responsive Layout

```
Mobile (≤480px):              Desktop (>480px):
┌────────────────────┐        ┌────────────┬───────────┐
│   Balance Display  │        │  Balance   │   Chart   │
├────────────────────┤        │  Display   │           │
│   Add Transaction  │        ├────────────┤           │
│       Form         │        │  Add Form  │           │
├────────────────────┤        ├────────────┴───────────┤
│  Category Filter   │        │  Category Filter       │
├────────────────────┤        ├────────────────────────┤
│ Transaction History│        │  Transaction History   │
│      (scroll)      │        │       (scroll)         │
└────────────────────┘        └────────────────────────┘
```

CSS uses `CSS custom properties` (variables) for colors/spacing, and `@media (max-width: 480px)` for the breakpoint. All spacing and font sizes use `rem`.

---

## Data Model

### LocalStorage Schema

Key: `ebv_transactions`  
Value: JSON-serialized array of Transaction objects.

```json
[
  {
    "id": "abc123",
    "description": "Coffee",
    "amount": 4.50,
    "category": "Food",
    "type": "Expense",
    "date": "2025-07-06",
    "createdAt": 1720281600000
  }
]
```

---

## Validation Rules

| Field       | Rule                                                      |
|-------------|-----------------------------------------------------------|
| description | Non-empty after trimming whitespace                       |
| amount      | Parseable as a finite number, value > 0                   |
| category    | Must be one of the predefined category values             |
| type        | Must be `'Income'` or `'Expense'`                         |
| date        | Valid ISO date string; defaults to today if not provided  |

---

## Error Handling

| Scenario                         | Handling                                                                |
|----------------------------------|-------------------------------------------------------------------------|
| LocalStorage unavailable         | Non-blocking warning banner; app continues in-memory only               |
| LocalStorage parse error         | Treat as empty; show warning; do not throw                              |
| Form validation failure          | Inline error messages per-field; form not submitted                     |
| UUID generation unavailable      | Fallback: `Date.now() + Math.random()` string                           |
| Canvas 2D context unavailable    | Hide chart area and show text fallback                                  |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Balance Calculation Correctness

*For any* list of transactions (any mix of Income and Expense, any amounts, any count including zero), the computed balance SHALL equal the sum of all Income amounts minus the sum of all Expense amounts.

**Validates: Requirements 1.2, 4.3**

---

### Property 2: Balance Formatting

*For any* numeric balance value (positive, negative, zero, fractional, large), the formatted balance string SHALL contain exactly two decimal places and a leading currency symbol (e.g., `$`), regardless of magnitude.

**Validates: Requirements 1.3**

---

### Property 3: Negative Balance Indicator

*For any* balance value: if the value is strictly negative, the balance display element SHALL have the negative-state CSS class applied; if the value is zero or positive, the negative-state CSS class SHALL NOT be applied.

**Validates: Requirements 1.4**

---

### Property 4: Transaction Validation

*For any* input tuple (description, amount): if description is empty or composed entirely of whitespace characters, OR if amount is not a finite number greater than zero, then the validation function SHALL return an error result and the transaction SHALL NOT be written to storage. Conversely, for any input where description is non-empty (after trimming) and amount is a positive finite number, validation SHALL succeed.

**Validates: Requirements 2.2, 2.3**

---

### Property 5: Persistence Round-Trip

*For any* valid transaction, after the transaction is added: (a) it SHALL be present in the data read back from LocalStorage, and (b) all its fields (description, amount, category, type, date) SHALL be preserved exactly (no data loss or mutation on serialization/deserialization).

**Validates: Requirements 2.4, 6.1, 6.2**

---

### Property 6: Surgical Delete

*For any* collection of transactions, after one transaction is deleted by its id: (a) that transaction SHALL no longer appear in the stored or in-memory list, and (b) all other transactions in the collection SHALL remain present and unmodified in LocalStorage.

**Validates: Requirements 4.2, 6.3**

---

### Property 7: Transaction List Sign Convention

*For any* transaction: if its type is `'Expense'`, the rendered amount string SHALL begin with a negative sign (`-`); if its type is `'Income'`, the rendered amount string SHALL begin with a positive sign (`+`).

**Validates: Requirements 3.2**

---

### Property 8: Transaction List Type Styling

*For any* transaction rendered in the history list, the list item DOM element SHALL carry a CSS class corresponding to its type (`transaction-item--expense` or `transaction-item--income`), enabling visually distinct rendering.

**Validates: Requirements 3.3**

---

### Property 9: Reverse-Chronological Ordering

*For any* list of transactions with varying dates, the rendered transaction history SHALL display entries in descending order by date (most-recent date first); transactions sharing the same date SHALL be ordered descending by creation timestamp.

**Validates: Requirements 3.5**

---

### Property 10: Category Chart Aggregation

*For any* set of expense transactions, the chart data SHALL contain exactly one entry per distinct category present in the expense transactions, and each entry's total SHALL equal the arithmetic sum of all expense amounts belonging to that category. No income transactions SHALL contribute to the chart totals.

**Validates: Requirements 5.1, 5.2**

---

### Property 11: Category Filter Correctness

*For any* list of transactions and any selected category value (other than `'All'`), the filtered result list SHALL contain only and all transactions whose category matches the selected value. For the `'All'` filter, the result SHALL contain every transaction regardless of category.

**Validates: Requirements 9.2, 9.3**

---

### Property 12: Filter Does Not Affect Balance or Chart

*For any* set of transactions and any active category filter, the computed balance and the chart category totals SHALL be identical to those computed with no filter applied (i.e., over the complete unfiltered transaction set).

**Validates: Requirements 9.4**

---

### Property 13: Clear All Resets State

*For any* non-empty collection of transactions, after the user confirms the "Clear All" action: the transaction list in both LocalStorage and in-memory SHALL be empty, and the computed balance SHALL be zero.

**Validates: Requirements 10.3**

---

### Property 14: Cancel Clear Preserves State

*For any* existing collection of transactions, if the user cancels the "Clear All" confirmation prompt, the in-memory and stored transaction collections SHALL be byte-for-byte identical to their pre-prompt state.

**Validates: Requirements 10.4**

---

### Property 15: Delete Controls Present for All Transactions

*For any* non-empty transaction list rendered in the history, each rendered transaction item SHALL contain exactly one delete control element, regardless of the transaction's type, category, or amount.

**Validates: Requirements 4.1**
