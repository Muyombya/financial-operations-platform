# Project Atlas — Database Schema Architecture

## Document Purpose

This document defines the conceptual PostgreSQL architecture for Project Atlas.

It translates the business rules and movement rules into a durable data model.

This document is the design contract for the SQL schema. The implementation
must preserve the relationships, history and business rules described here.

---

# 1. Database Philosophy

Project Atlas uses PostgreSQL as its operational database.

The database must protect financial and organizational integrity through:

- Foreign keys
- Unique constraints
- Check constraints
- Not-null constraints
- Database transactions
- Explicit movement records
- Historical records
- Controlled status transitions
- Audit records

The database must not silently overwrite important business history.

---

# 2. Core Modeling Principle

Project Atlas distinguishes between four kinds of information:

## 2.1 Master Data

Defines what exists.

Examples:

- Company
- Branch
- Till
- Staff member
- Provider
- Service
- Customer

## 2.2 Current State

Describes the current operational position.

Examples:

- Active Till
- Current service assignment
- Current financial position
- Current staff assignment

## 2.3 Historical Records

Preserves what happened.

Examples:

- Capital movements
- Transactions
- Till sessions
- Service assignments
- Branch assignments
- Expenses
- Position history

## 2.4 Audit Records

Explains who changed or authorized something.

These four categories must not be unnecessarily collapsed into one table.

---

# 3. Organization Hierarchy

The primary organizational hierarchy is:

Company

→ Branch

→ Till

→ Service

A company may have many branches.

A branch may have many Tills.

A Till may have many assigned services.

A Till is an organizational asset and is not owned by an individual employee.

---

# 4. Company

The company is the root organizational entity.

The company stores organizational identity and configuration.

The company owns:

- Branches
- Staff Repository
- Services
- Financial Pools
- Organizational knowledge
- Operational history

The company must exist before branches, staff assignments and operational
records can be created.

---

# 5. Branch

Each branch belongs to exactly one company.

A branch stores:

- Identity
- Name
- Code
- Operational status
- Location information
- Operating configuration

A branch may have:

- Operating capital allocations
- Expense fund
- Tills
- Staff assignments
- Sessions
- Transactions
- Expenses
- Operational history

A branch must remain historically identifiable even after deactivation.

---

# 6. Financial Pools

Financial pools represent separately controlled sources or destinations
of funds.

Examples:

- Operating Capital
- Expense Fund
- Salaries / Compensation
- Expansion
- Emergency

A financial pool has:

- Owner organization
- Purpose
- Status
- Configuration

The current balance must not be the only record of financial history.

Pool balances are derived from or supported by recorded movements.

---

# 7. Capital Allocations

Capital allocation represents the deployment of value through the
organization.

The database must be capable of representing:

Company → Branch

Branch → Till

Till → Service

and authorized reverse or lateral movements.

Allocations must preserve:

- Source
- Destination
- Amount
- Movement type
- Reason
- Initiator
- Timestamp
- Reference

---

# 8. Staff Repository

Staff members belong to the company Staff Repository.

A staff member must not be permanently embedded in a branch or Till record.

Staff and organizational assignments are separate concepts.

This permits:

Staff

→ Branch A

later becoming:

Staff

→ Branch B

while preserving historical assignments.

---

# 9. Branch Staff Assignments

A staff assignment records that a staff member is assigned to a branch
during a defined period.

The assignment should preserve:

- Staff member
- Branch
- Start date/time
- End date/time
- Assignment status
- Responsible authority
- Reason where applicable

Historical assignments must remain available.

---

# 10. Till

A Till belongs to one branch.

Till identity includes:

- Name
- Type
- Purpose
- Status
- Operational policy
- Branch

Till names are management-defined and must not be hardcoded.

A Till may be active, suspended, retired or otherwise configured according
to business policy.

A Till with operational history must not be physically deleted.

---

# 11. Till Policies

Till behavior must be configurable.

Different Tills may have different operational policies.

This is required for specialized Tills such as:

Mtn Agents Float Till

A policy may define:

- Operating mode
- Session behavior
- Allowed transaction types
- Field/roving operation
- Service rules
- Balance rules
- Approval requirements

Policies should be data-driven rather than hardcoded wherever practical.

---

# 12. Service Providers

A provider represents an external service provider or financial institution.

Examples:

- MTN
- Airtel
- Centenary Bank
- Equity Bank
- Stanbic Bank
- DFCU Bank
- Absa Bank

Providers should not be hardcoded into application logic.

A provider may offer one or more services.

---

# 13. Services

A service represents an operational service offered through a provider
or internally through the company.

A service should be independently identifiable from its provider.

Examples may include:

- MTN Mobile Money
- Airtel Money
- Centenary Bank
- Utility Payment
- Cash

This allows a provider to have multiple services in future without
changing the database architecture.

---

# 14. Service Pool

Services available to the organization are held in the Service Pool before
assignment.

The Service Pool is the source from which services are assigned to Tills.

A service assignment must preserve history.

A service can move:

Service Pool

→ Till A

→ Service Pool

→ Till B

The database must retain every assignment period.

---

# 15. Till Service Assignments

A service assignment records that a service is available on a specific Till
during a defined period.

The record should preserve:

- Till
- Service
- Assignment start
- Assignment end
- Assignment status
- Responsible user
- Reason

The database must prevent an invalid duplicate active assignment where the
business does not permit one service instance to operate on multiple Tills.

---

# 16. Till Sessions

A Till operates through sessions.

A session identifies:

- Business date
- Branch
- Till
- Attendant
- Opening time
- Closing time
- Status

A Till should not have conflicting active sessions.

Session history must remain available.

---

# 17. Session Attendance and Inactivity

The system must preserve meaningful session activity information.

It should be possible to record:

- Login
- Logout
- Stepping away
- Return
- Reason for leaving
- Automatic logout
- Inactivity duration

The inactivity timeout must be configurable.

The initial proposed default is five minutes.

The database should distinguish between:

- Voluntary logout
- Authorized temporary absence
- Automatic inactivity logout

---

# 18. Customers

Customers are organizational records, not merely transaction fields.

The customer model should support returning-customer recognition.

Potential identifiers include:

- Phone number
- Account number
- Customer reference
- Name

Customer records should preserve relevant history without requiring
duplicate customer creation for every transaction.

---

# 19. Customer Transactions

A transaction represents a customer-facing operational event.

The transaction must identify:

- Company
- Branch
- Till
- Session
- Service
- Provider where applicable
- Customer where applicable
- Initiating staff member
- Agent identifier
- Transaction type
- Amount
- External reference where available
- Internal transaction identifier
- Status
- Timestamp

The initiating agent identifier is mandatory for applicable transactions.

Transaction history must be immutable through normal user actions.

---

# 20. Agent Identity

The initiating agent is a first-class operational attribute.

Transaction counting must be possible by agent identifier.

This is particularly important for:

- Mobile money
- Agency banking
- Agent float
- Provider transactions

Agent identifiers must not be inferred solely from the Till or branch.

A Till can be operated by different people at different times.

---

# 21. Mtn Agents Float Till

The Mtn Agents Float Till is a specialized Till.

Its customers are MTN agents.

The model must support:

- Agent customer profiles
- Agent numbers
- Agent transaction history
- Float distributions
- Field/roving operation
- Daily balancing
- Specialized Till policies

The Till remains associated with its mother branch for organizational
accountability even when operating in the field.

---

# 22. Financial Positions

A position represents the current or historical amount associated with
a financial location.

Potential position levels include:

- Company financial pool
- Branch
- Till
- Service
- Expense Fund
- Compensation Pool

Current positions should be optimized for operational queries.

Historical changes must be preserved through movements and related history.

---

# 23. Movement Ledger

Financial movements are the historical explanation for position changes.

A movement should identify:

- Source
- Destination
- Amount
- Movement type
- Initiating user
- Date/time
- Reason
- Reference
- Related session where applicable
- Related transaction where applicable

The movement ledger is the authoritative historical explanation of
financial changes.

Balances must not be maintained solely by overwriting a single number.

---

# 24. Current Position

Project Atlas may maintain current-position records for fast operational
screens.

These records represent current state.

They do not replace the movement history.

Whenever a financial movement changes a position, the corresponding current
position must be updated consistently with the movement.

---

# 25. Opening and Closing Positions

A Till session may have opening and closing positions for services.

Opening positions should preserve their source.

Possible sources include:

- Previous closing position
- New allocation
- Transfer
- Authorized adjustment

Closing positions must remain historically available.

---

# 26. Actual Position

The system position may differ from the actual physical or observed
position.

Where authorized, the database must preserve:

- System position
- Actual position
- Difference
- Reason
- User
- Timestamp

An actual-position correction must generate an audit record.

---

# 27. Expense / Cash Book

The branch Expense Fund is independent of operating capital.

The database must represent:

- Expense fund
- Fund top-ups
- Expense categories
- Individual expenses
- Responsible user
- Branch
- Historical expenditure

Expense activity must not silently reduce branch operating capital.

---

# 28. Salaries and Compensation

Compensation requires a dedicated operational model even though salaries
are accounting expenses.

The model should eventually support:

- Salary
- Allowances
- Commission
- Bonus
- Overtime
- Deductions
- Advances
- Payment records

Compensation must remain linked to the employee and applicable period.

---

# 29. Organizational Knowledge

Knowledge belongs to the organization.

The data model should support knowledge with scopes such as:

- Company
- Branch
- Till
- Service
- Role
- Learning group

Knowledge should preserve:

- Source
- Author
- Approval status
- Effective period
- Version
- Applicability

---

# 30. Reasons and Organizational Memory

Reasons entered during operations should be preserved where appropriate.

The model should allow the system to find similar previous reasons.

A new reason must remain possible even when similar historical reasons
exist.

The purpose is to create organizational memory, not to force repetitive
answers.

---

# 31. People Development

The database should eventually support a People Growth Engine.

Potential records include:

- Training
- Learning assignments
- Completion
- Coaching
- Recognition
- Performance observations
- Development milestones
- Contributions

Employee development history must remain available after an employee
leaves the organization.

---

# 32. Audit

Audit records are separate from ordinary operational history.

Audit should preserve important actions such as:

- Balance adjustments
- Till changes
- Service movement
- Staff assignment
- Authorization
- Transaction corrections
- Configuration changes

Audit records should identify:

- Actor
- Action
- Entity
- Previous state where applicable
- New state where applicable
- Timestamp
- Reason
- Related reference

---

# 33. AI Data Foundation

AI must consume operational data without becoming the authoritative
source of financial truth.

AI may analyze:

- Movements
- Transactions
- Positions
- Customers
- Expenses
- Staff activity
- Knowledge
- Sessions
- Service performance

AI recommendations must be stored separately from confirmed operational
actions where practical.

This distinction allows the system to measure:

- Recommendation
- Human decision
- Result
- Outcome

That history will eventually allow the Operations Intelligence Engine to
improve over time.

---

# 34. Multi-Company Architecture

Project Atlas is intended to become a platform capable of supporting
multiple companies.

Every company-owned operational record must therefore be traceable to its
own company.

Cross-company data access must be explicitly controlled.

Company data must not leak across organizational boundaries.

---

# 35. Deletion Philosophy

Important business history must not be physically deleted merely because
the related object is no longer active.

Examples:

- Retired Till
- Former staff member
- Old service assignment
- Closed session
- Completed transaction
- Historical expense
- Completed movement

Where appropriate, use status changes, retirement or archival instead of
destructive deletion.

---

# 36. Naming Philosophy

Database names should remain technically consistent and predictable.

User-facing names should remain familiar to the business.

The database may use technical identifiers where required, but application
screens should prefer established business vocabulary such as:

- Company
- Branch
- Till
- Service
- Opening Balance
- Closing Balance
- Cash Book
- Float
- Attendant
- Manager
- Customer
- Transaction
- Transfer
- Reason

---

# 37. Integrity Requirements

The database must enforce business-critical integrity wherever practical.

Examples:

- A Till cannot belong to a nonexistent branch.
- A staff assignment cannot reference a nonexistent staff member.
- A transaction cannot reference a nonexistent Till.
- A service assignment cannot reference a nonexistent service.
- Financial movements must have positive valid amounts.
- Required agent identifiers cannot be null for applicable transactions.
- Completed historical records must not be casually deleted.
- A movement involving two positions must preserve both sides.

---

# 38. Schema Evolution

Project Atlas will use controlled database migrations.

The database must not depend permanently on one ever-growing SQL file.

Each significant structural change should be represented by a migration
that preserves the evolution of the schema.

The repository should maintain a clear history of database changes.

---

# 39. Current Target Domain Map

The initial database domains are:

1. Organization
2. Financial Pools
3. Capital and Positions
4. Branches
5. Tills
6. Till Policies
7. Service Providers
8. Services
9. Service Assignments
10. Staff Repository
11. Staff Assignments
12. Till Sessions
13. Customers
14. Transactions
15. Expenses
16. Compensation
17. Organizational Knowledge
18. People Development
19. Audit
20. AI Recommendations
21. Reporting Support

These domains may be implemented incrementally.

They do not all need to become operational in the first release.

---

# 40. Database Architecture Principle

The Project Atlas database must answer two questions simultaneously:

1. What is true right now?

2. How did it become true?

Current state supports operations.

Historical movement and event records preserve organizational memory.

Both are required.

The database is therefore not merely a storage system.

It is the historical foundation upon which Project Atlas can provide
operational intelligence.
