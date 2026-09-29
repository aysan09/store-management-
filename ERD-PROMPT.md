# ERD Database Diagram — Prompt Pack

Two prompts below:

1. **Reusable template** — generic, with `{{placeholders}}` for any project.
2. **Ready-to-use example** — pre-filled for the inventory / request-management app described in `src/styles.css`.

---

## 1. Reusable template

```
ROLE
You are a senior database architect. You produce accurate, normalized ERD
(entity-relationship) diagrams that are valid, copy-pasteable code — not prose.

TASK
Design a complete Entity-Relationship Diagram for: {{SYSTEM_NAME_AND_ONE_LINE_PURPOSE}}.

DOMAIN INPUTS
- Domain description: {{WHAT_THE_APP_DOES}}
- Known actors/roles: {{ROLES e.g. employee, HR, store manager, admin}}
- Known business objects: {{NOUNS e.g. employee, item, request, notification}}
- Known workflows: {{e.g. request submitted -> HR review -> approved/rejected -> finished}}
- Known business rules: {{e.g. quantity cannot exceed stock; one request has many line items}}

STEP 1 — ENTITY DISCOVERY (show this before the diagram)
List every entity you identify. For each: name (singular PascalCase), one-line
purpose, and whether it is a strong entity, weak entity, or associative/junction
table. Explicitly justify any junction table you introduce.

STEP 2 — ATTRIBUTES
For every entity give a table with: Attribute | Type | Key (PK/FK/UK) | Nullable |
Default | Notes. Rules:
- Every entity gets a surrogate PK: id (BIGINT/UUID) unless a natural key is clearly better.
- Mark FKs and state the referenced entity.
- Use consistent types (BIGINT, VARCHAR(n), TEXT, DECIMAL(10,2), BOOLEAN, TIMESTAMP, ENUM).
- Model statuses as ENUM or a lookup table, and say which you chose and why.
- Add created_at / updated_at to mutable entities.
- Normalize to 3NF; call out any deliberate denormalization.

STEP 3 — RELATIONSHIPS
For each relationship give: Entity A | Cardinality | Entity B | Optionality |
Verb phrase | FK location | ON DELETE / ON UPDATE behavior.
Use Crow's Foot notation. State every cardinality explicitly (1:1, 1:N, M:N).
Every M:N relationship must become a junction table with its own attributes if it
carries data (e.g. quantity, date_added, status).

STEP 4 — CONSTRAINTS & INDEXES
- Primary, foreign, unique, and CHECK constraints.
- Indexes needed for the known query patterns (search, filter, sort by date/status).
- Cascade rules for deletes/updates.

STEP 5 — DIAGRAM OUTPUT (code only, no commentary inside the block)
Produce BOTH of these, fully valid and renderable:
a) A Mermaid `erDiagram` block.
b) A PlantUML `@startuml ... @enduml` block using Crow's Foot notation.

MERMAID RULES
- Syntax: `ENTITY { TYPE name PK "comment" }` then `A ||--o{ B : "verb"`.
- Relationship operators: `||--||` 1:1, `||--o{` 1:N, `}o--o{` M:N.
- Keep attribute names lowercase snake_case; no spaces inside the block.
- Every entity from Step 1 must appear; no orphan entities.

PLANTUML RULES
- Use `entity` blocks and `||--o{` crow's foot syntax.
- Add `skinparam` lines for a clean, readable layout.

STEP 6 — TEST / SEED DATA
- Produce a runnable INSERT script for every table, ordered so no FK references
  a row that does not exist yet. State the insert order explicitly.
- Use realistic volumes, not 2 rows per table: scale to the domain, and make
  sure every enum value, every nullable FK (left NULL at least once), and every
  boundary value (0, max, empty string, longest text) appears in the data.
- Add a coverage table listing each enum value / nullable FK / boundary and
  which row exercises it. Flag anything not covered.
- Confirm referential integrity: child count per parent, no orphans.
- Default dialect: {{DIALECT e.g. PostgreSQL}}. Be consistent throughout.
- Insert test rows into the real tables in dependency order. Do NOT invent
  parallel `test_*` tables; only propose a separate fixture table if multiple
  named datasets must coexist, and justify it.

STEP 7 — TEST QUERIES
- 8–12 SELECT queries that validate the business rules, each with the expected
  result in a comment.
- 3–5 negative INSERT/UPDATE statements that MUST fail, naming the constraint
  each one trips.

STEP 8 — REVIEW
- List the assumptions you made because the input was ambiguous.
- List 3–5 open questions that would change the schema.
- Confirm the schema is in 3NF and note any place it is not.

OUTPUT FORMAT
Markdown. One section per step, in order. Code blocks fenced with the correct
language tag (`mermaid`, `plantuml`, `sql`). Seed and query scripts must be
complete and runnable — no `...` placeholders, no "repeat for remaining rows".
No filler sentences, no apologies.

CONSTRAINTS
- Do not invent entities that the domain description does not imply.
- Do not omit junction tables for M:N relationships.
- Do not use reserved words as identifiers (user, order, group, table) without
  prefixing them.
```

---

## 2. Ready-to-use example (inventory & request management app)

```
ROLE
You are a senior database architect. You produce accurate, normalized ERD
diagrams that are valid, copy-pasteable code — not prose.

TASK
Design a complete Entity-Relationship Diagram for an internal Inventory &
Item-Request Management System used by a company.

DOMAIN INPUTS
- Purpose: employees request store items; HR reviews the requests; the store
  manager maintains stock; everyone can track request status.
- Actors/roles: Employee (requester), HR (reviewer), Store Manager (stock owner),
  Admin (manages employee accounts and passwords).
- Business objects: employee, department, position, item/product, stock, request,
  request line item, notification, status history.
- Workflows:
  1. Employee registers / is registered by HR with an employee ID, department,
     position, and password.
  2. Employee submits a request for one or more items with a quantity, purpose,
     and date.
  3. HR reviews pending requests individually or in bulk and approves or rejects.
  4. Approved requests are fulfilled and marked finished; finished requests are
     retained as permanent records.
  5. The store manager edits/deletes items, sees stock counts, and gets an
     out-of-stock / reorder alert.
  6. Notifications are generated for HR when new requests arrive, with a
     read/unread flag and a timestamp.
- Business rules:
  - A request can contain many items; an item can appear in many requests
    (many-to-many, with quantity and line-level status on the join).
  - A request has exactly one requester (employee) and at most one reviewer (HR).
  - Request status is one of: pending, approved, rejected, finished.
  - Item quantity in stock is never negative; zero means out of stock.
  - An employee belongs to exactly one department and holds one position.
  - Deleting an employee must not delete their historical requests.

STEP 1 — ENTITY DISCOVERY
List each entity (singular PascalCase), its purpose, and whether it is strong,
weak, or associative. Justify `request_item` as the associative entity.

STEP 2 — ATTRIBUTES
Table per entity: Attribute | Type | Key | Nullable | Default | Notes.
Use BIGINT surrogate PKs, VARCHAR for codes/names, DECIMAL(10,2) for price,
TIMESTAMP for dates, ENUM for statuses. Include created_at / updated_at.

STEP 3 — RELATIONSHIPS
Table: Entity A | Cardinality | Entity B | Optionality | Verb | FK location |
ON DELETE / ON UPDATE. Use Crow's Foot notation and state every cardinality.

STEP 4 — CONSTRAINTS & INDEXES
PK/FK/UNIQUE/CHECK constraints, indexes for search-by-name, filter-by-status,
and sort-by-date, plus cascade rules.

STEP 5 — DIAGRAM OUTPUT
Produce a valid Mermaid `erDiagram` block and a valid PlantUML block with
Crow's Foot notation. All entities included, no orphans.

STEP 6 — TEST / SEED DATA (this is the part most prompts forget)
Do not hand-wave this. For EVERY table from Step 1, produce a ready-to-run
INSERT script.

6a. Insert order — an executable script, topologically sorted so no FK ever
    points at a row that does not exist yet. State the order explicitly
    (departments -> positions -> employees -> items -> requests -> request_items
    -> notifications).

6b. Volume — realistic, not 2 rows per table:
  - Departments, Positions: 5 each
  - Employees: 15 (at least 1 HR, 1 store manager, 1 admin, 12 requesters)
  - Items: 25 across at least 4 brand/category groups, 3 of them with
    quantity_in_stock = 0 to exercise the out-of-stock / reorder path
  - Requests: 40 spanning all 4 statuses (>=8 pending, >=10 approved,
    >=8 rejected, >=8 finished)
  - RequestItems: 60+ rows, including at least one request with 3+ line items
    and at least one item reused across multiple requests
  - Notifications: 20, mixed is_read true/false, some tied to items, some not

6c. Coverage matrix — a table proving the seed data exercises every branch:
    each enum value, each nullable FK left NULL at least once (e.g. a pending
    request with reviewer_id IS NULL), each boundary (quantity 0, quantity max,
    price 0, longest allowed purpose text). Flag any enum value or constraint
    the data does NOT cover.

6d. Referential integrity proof — for each FK, state how many child rows
    reference each parent, and confirm no orphan rows exist. List any parent
    with zero children (that is allowed, but say so).

6e. Dialect — write the scripts for PostgreSQL by default. If a different
dialect is requested, use it consistently (MySQL: backticks + ENGINE=InnoDB;
SQLite: no ENUM, use CHECK; SQL Server: IDENTITY + GO batches). Insert in FK
order and wrap the whole script in a single transaction with a rollback note.

6f. Do NOT invent a separate `test_*` table to hold fake data. Test data is
    rows in the real tables, inserted in dependency order. Only propose a
    dedicated fixture/dataset table if there is genuine reason to keep multiple
    named environments, and say why.

STEP 7 — TEST QUERIES
Write 8–12 SQL queries that validate the schema against the business rules,
each with the expected result stated in a comment:
  - Requests still pending with no reviewer assigned.
  - Request totals grouped by status.
  - Items currently out of stock and the open requests that would consume them.
  - Employees with more requests than the average of their department.
  - Bulk-approve preview: all pending rows selected by a given HR.
  - Requests containing more than one line item.
  - Unread notification count per HR recipient.
  - Any request referencing a deleted/soft-deleted requester.
Also write the negative tests: an INSERT that MUST fail (claiming more stock
than exists, a duplicate employee_code, a request_item quantity <= 0) and
state which constraint raises the error.

STEP 8 — REVIEW
Assumptions, 3–5 open questions, and a 3NF confirmation.

OUTPUT FORMAT
Markdown, one section per step, fenced code blocks with correct language tags.
Seed and query scripts are complete and runnable — no `...` placeholders, no
"repeat for the remaining rows".
No filler, no apologies.
```

---

## 3. Optional one-liner variant (for tools with a single input box)

```
Generate a Crow's Foot ERD for an internal Inventory & Item-Request Management
System. Entities: Employee (id, employee_code, name, email, password_hash,
department_id, position_id, created_at), Department, Position, Item (id, brand,
model, image_url, quantity_in_stock, price, is_out_of_stock), Request (id,
requester_id, reviewer_id, status[enum: pending/approved/rejected/finished],
purpose, requested_at, reviewed_at), RequestItem (request_id, item_id, quantity,
line_status), Notification (id, recipient_id, message, item_id, is_read,
created_at). Employee 1:N Request as requester; Employee 1:N Request as reviewer;
Request M:N Item through RequestItem; Department 1:N Employee; Position 1:N
Employee; Employee 1:N Notification; Item 1:N Notification. Output valid Mermaid
erDiagram and PlantUML with 3NF, PK/FK/UK/CHECK constraints, and indexes for
status filtering and date sorting. Then output a complete runnable seed-data
script inserting in FK order: 5 departments, 5 positions, 15 employees (1 HR,
1 store manager, 1 admin, 12 requesters), 25 items (3 with stock 0), 40 requests
covering all 4 statuses, 60+ request_items (including one request with 3+ items
and one item reused across requests), and 20 notifications with mixed read
flags. Include a coverage table showing every enum value, every nullable FK
left NULL at least once, and every boundary tested. Finish with 8-12 validation
queries plus 3 INSERT statements that must fail and the constraint each trips.
```
