# Project Atlas — Development Roadmap

## Document Purpose

This document defines the planned engineering sequence for Project Atlas.

The roadmap converts the business rules, movement rules, database architecture,
API specification and screen flows into an incremental development program.

Project Atlas will be built one engine at a time.

Each engine must be tested before the next dependent engine is introduced.

---

# 1. Development Principles

Project Atlas development follows these principles:

1. Business rules come before implementation.
2. Financial integrity comes before convenience.
3. Historical records must be preserved.
4. Current state and historical movement must remain distinguishable.
5. User-facing language must remain familiar to the business.
6. Backend rules must not depend on frontend enforcement.
7. Financial actions must be atomic.
8. Network failure must be expected, not treated as exceptional.
9. AI must support decisions without bypassing financial controls.
10. Every completed engine must be testable before the next engine is built.

---

# 2. Development Environment

## 2.1 Local Development

The primary local development environment will contain:

- Git
- Visual Studio Code
- Node.js
- PostgreSQL
- pgAdmin 4
- React
- Vite
- Express

The exact supported versions will be documented when the environment is
initialized.

---

# 3. Repository Structure

The project will evolve toward a structure similar to:

```text
financial-operations-platform/
│
├── database/
├── docs/
├── backend/
├── frontend/
├── tests/
└── README.md
```

Database migrations will be maintained as controlled versioned changes.

---

# 4. Phase A — Platform Foundation

## Objective

Establish the technical foundation before implementing business engines.

Tasks:

- Confirm development environment
- Install PostgreSQL
- Configure pgAdmin 4
- Create local development database
- Establish environment variables
- Initialize backend
- Initialize frontend
- Configure Git workflow
- Establish database migration strategy
- Establish API versioning
- Establish error handling
- Establish logging
- Establish testing foundation

Deliverable:

A running empty Project Atlas application with a verified database connection.

---

# 5. Phase B — Organization Engine

## Objective

Establish the organizational structure.

Build:

- Company
- Branch
- Organization settings
- Branch lifecycle
- Company isolation

The engine must support multiple companies even if the first deployment
contains only one company.

Deliverable:

A company can create and manage its branches.

---

# 6. Phase C — Financial Pool Engine

## Objective

Model the organization's financial pools.

Build:

- Operating Capital
- Expense Fund
- Salaries / Compensation
- Other configurable pools
- Pool funding
- Pool allocation
- Pool balances
- Pool movement history

Deliverable:

Management can see where organizational funds are allocated without
silently changing historical records.

---

# 7. Phase D — Till Engine

## Objective

Create the operational Till framework.

Build:

- Till Birth
- Till naming
- Till type
- Till purpose
- Till policies
- Till lifecycle
- Till activation
- Till suspension
- Till retirement

Deliverable:

A manager can create, configure, activate and retire Tills without
hardcoded Till names.

---

# 8. Phase E — Service Provider and Service Engine

## Objective

Build the consolidated Service Pool.

Build:

- Providers
- Services
- Service configuration
- Service Pool
- Till service assignment
- Service release
- Service mobility
- Assignment history

Deliverable:

Management can create services, assign them to Tills, return them to the
Service Pool and move them between Tills.

---

# 9. Phase F — Staff Repository and Access Engine

## Objective

Establish the organization's staff model.

Build:

- Staff Repository
- Staff profiles
- Roles
- Employment status
- Branch assignments
- Staff transfers
- Till access
- Access history
- Manager visibility

Deliverable:

A staff member can belong to the company, be assigned to a branch and
receive authorized access to a Till without becoming the owner of that Till.

---

# 10. Phase G — Till Session and Attendance Engine

## Objective

Control Till operating sessions.

Build:

- Till login
- Session opening
- Opening positions
- Step Away
- Return
- Inactivity detection
- Automatic logout
- Session closing
- Closing positions
- Session history

Deliverable:

A Till can be safely opened, operated, paused and closed with complete
session history.

---

# 11. Phase H — Movement and Position Engine

## Objective

Establish the financial movement foundation.

Build:

- Current positions
- Movement ledger
- Company-to-Branch allocation
- Branch-to-Till allocation
- Till-to-Service allocation
- Till-to-Till movement
- Branch-to-Branch movement
- Service-to-Service conversion
- Reallocation
- Reversal
- Adjustment
- Actual Position

Deliverable:

Every important financial position can be explained through recorded
movements.

This is one of the most critical engines in Project Atlas.

---

# 12. Phase I — Transaction Engine

## Objective

Build customer-facing transaction processing.

Build:

- Deposits
- Withdrawals
- Utility payments
- Other configured transaction types
- External references
- Internal transaction IDs
- Agent identifiers
- Transaction status
- Transaction reversal
- Idempotency

Deliverable:

An attendant can safely complete a customer transaction and the system
can identify exactly which agent initiated it.

---

# 13. Phase J — Customer Memory Engine

## Objective

Turn customer history into a useful operational advantage.

Build:

- Customer profiles
- Phone/account identification
- Customer search
- Returning customer recognition
- Transaction history
- Service usage history
- Customer context
- Appropriate personalization

Deliverable:

An attendant can recognize and serve returning customers faster without
unnecessary repeated data entry.

---

# 14. Phase K — Expense / Cash Book Engine

## Objective

Digitize branch expense management.

Build:

- Expense Fund
- Fund replenishment
- Expense categories
- Expense recording
- Expense approvals where required
- Branch expenditure reporting
- Expense history

Deliverable:

Each branch can manage and report its separate Cash Book without mixing
expense funds with operating capital.

---

# 15. Phase L — Mtn Agents Float Engine

## Objective

Build the new MTN agent float business as a specialized operational
capability.

Build:

- Mtn Agents Float Till
- Agent customer profiles
- Agent numbers
- Float transactions
- Field / roving operation
- Daily balancing
- Agent transaction history
- Float performance reporting
- Specialized Till policy

Deliverable:

The business can serve small MTN agents with float and understand the
performance of this new service line.

---

# 16. Phase M — Reconciliation Engine

## Objective

Compare expected positions against actual positions.

Build:

- Expected position
- Actual position
- Difference
- Difference reason
- Authorized adjustment
- Reconciliation status
- Daily reconciliation
- Branch reconciliation
- Till reconciliation
- Service reconciliation

Deliverable:

Management can determine not only what the system says, but whether
physical or provider positions agree with it.

---

# 17. Phase N — Audit Engine

## Objective

Make operational history understandable and trustworthy.

Build:

- Audit events
- Before/after values
- User identity
- Action
- Reason
- Related movement
- Related transaction
- Search
- Filtering
- Human-readable event flow

Deliverable:

Management can understand what happened, who did it and why.

---

# 18. Phase O — Knowledge and Learning Engine

## Objective

Turn company knowledge into an operational asset.

Build:

- Organizational knowledge
- Procedures
- Rules
- Training content
- Branch knowledge
- Till reminders
- Service reminders
- Role-based learning
- Reason suggestions
- Knowledge approval
- Knowledge versioning

Deliverable:

A new attendant can receive useful company knowledge from the system,
starting from their first day.

---

# 19. Phase P — People Growth Engine

## Objective

Help employees develop through the system.

Build:

- Learning progress
- Coaching
- Recognition
- Development goals
- Performance observations
- Contributions
- Growth history

Deliverable:

Project Atlas supports employee development rather than merely measuring
employee activity.

---

# 20. Phase Q — Reporting Engine

## Objective

Convert operational history into useful management information.

Build:

- Transaction reports
- Agent reports
- Till reports
- Branch reports
- Service reports
- Capital reports
- Expense reports
- Reconciliation reports
- Customer activity reports
- Historical reports
- Export and print functions

Deliverable:

Management can ask operational questions and receive detailed answers.

---

# 21. Phase R — Business Intelligence Engine

## Objective

Move from reporting what happened to explaining what matters.

Build:

- Trend analysis
- Exceptions
- Service demand patterns
- Branch performance
- Till performance
- Funding recommendations
- Transfer recommendations
- Expense patterns
- Customer behavior patterns
- Agent performance patterns

Deliverable:

Project Atlas identifies important patterns without requiring management
to manually inspect every report.

---

# 22. Phase S — AI Intelligence Engine

## Objective

Provide contextual intelligence across the organization.

Build:

- Daily Intelligence Brief
- AI recommendations
- Organizational memory retrieval
- Similar-reason suggestions
- Staff learning assistance
- Customer service assistance
- Operational explanations
- Forecasting
- Recommendation history
- Recommendation outcomes

AI must remain subject to business authorization and financial controls.

Deliverable:

AI becomes an assistant to the organization rather than an uncontrolled
financial actor.

---

# 23. Phase T — Platform Hardening

## Objective

Prepare Project Atlas for reliable production use.

Build and verify:

- Security
- Authorization
- Multi-company isolation
- Backups
- Recovery
- Monitoring
- Error handling
- Audit integrity
- Performance
- Rate limiting
- Data retention
- Migration procedures
- Deployment procedures
- Mobile network resilience

Deliverable:

A production-ready platform foundation.

---

# 24. Phase U — Platform Expansion

Once the core platform is stable, Project Atlas may support:

- Additional companies
- Additional service providers
- Additional banking services
- Additional financial products
- Additional branches
- Additional user roles
- External integrations
- Mobile applications
- Advanced AI capabilities

Expansion must not compromise the original business rules.

---

# 25. Engine Completion Standard

An engine is not considered complete merely because its screens work.

Each engine must have:

1. Business rules implemented.
2. Database structures implemented.
3. Backend operations implemented.
4. API endpoints implemented.
5. User interface implemented.
6. Validation implemented.
7. Authorization implemented.
8. Audit behavior implemented where required.
9. Error handling implemented.
10. Network failure behavior considered.
11. Test scenarios completed.
12. Realistic business testing performed.

Only then should dependent work proceed.

---

# 26. Testing Philosophy

Testing will use business scenarios, not only technical unit tests.

Example:

> Martin arrives and deposits UGX 100,000 through MTN.

The test should verify:

- Customer identification
- Service selection
- Agent identity
- Till
- Session
- Transaction
- Movement
- Position
- Audit
- Customer history
- Reporting

The objective is to verify the complete business flow.

---

# 27. Network Testing

Every financial engine must be tested under unreliable connectivity.

Test scenarios include:

- Connection lost before submission
- Connection lost during submission
- Connection lost after successful server processing
- Client retry
- Duplicate request
- Delayed response
- Provider unavailable
- Bank system unavailable
- Partial external service failure

The system must never create duplicate financial transactions because a
user retried after losing connectivity.

---

# 28. Provider Availability

Project Atlas must recognize that external providers may become
temporarily unavailable.

Example:

Centenary Bank system unavailable.

The system should communicate:

- Provider unavailable
- Affected services
- Current status
- What the attendant can still do
- What should wait
- Whether an operation is pending

A provider outage must not unnecessarily disable unrelated services.

---

# 29. Development Sequence

The initial implementation sequence is:

```text
Foundation
    ↓
Organization
    ↓
Financial Pools
    ↓
Tills
    ↓
Services
    ↓
Staff & Access
    ↓
Sessions
    ↓
Movement & Positions
    ↓
Transactions
    ↓
Customers
    ↓
Expenses
    ↓
MTN Agent Float
    ↓
Reconciliation
    ↓
Audit
    ↓
Knowledge & Learning
    ↓
People Growth
    ↓
Reporting
    ↓
Business Intelligence
    ↓
AI Intelligence
    ↓
Platform Hardening
```

Dependencies may cause individual tasks to overlap, but the financial
integrity foundation must remain ahead of higher-level intelligence.

---

# 30. Release Philosophy

Project Atlas will be released incrementally.

Each release should produce a usable improvement.

Example:

Release 1:

Organization + Branches

Release 2:

Tills + Services

Release 3:

Staff + Sessions

Release 4:

Movement + Positions

Release 5:

Transactions

Release 6:

Customers

Release 7:

Expenses

Release 8:

MTN Agent Float

Further releases expand intelligence, reporting and people development.

---

# 31. Git Workflow

Development should use controlled Git commits.

A completed engine should have a meaningful commit.

Example:

`Build Organization Engine`

or:

`Build Till and Service Engine`

Changes should be tested before committing.

The main branch should represent a stable version.

Development work may be performed on a development branch where appropriate.

---

# 32. Documentation Workflow

When a major business rule changes:

1. Update the relevant documentation.
2. Review affected database rules.
3. Review affected API behavior.
4. Review affected screen flows.
5. Update implementation.
6. Test the change.
7. Commit the complete change.

Business documentation is part of the system's engineering record.

---

# 33. One Engine at a Time

Project Atlas will deliberately avoid building everything simultaneously.

The working pattern is:

Understand

↓

Document

↓

Design

↓

Build

↓

Test

↓

Review

↓

Correct

↓

Commit

↓

Move to next engine

This allows business experts and engineers to continuously validate the
system together.

---

# 34. Business Expert Review

The business owner remains the final authority on whether an implemented
flow reflects actual business practice.

The engineer is responsible for translating the business rules into a
reliable technical system.

Testing must therefore include questions such as:

- Does this reflect how the company operates?
- Would an attendant understand this?
- Does this make service faster?
- Does this protect the money?
- Does this preserve history?
- Does this help management?
- Does this improve customer experience?

---

# 35. Project Atlas Long-Term Vision

Project Atlas is intended to evolve from a financial operations system
into an operational intelligence platform.

Its long-term capabilities should connect:

Operations

+

Money

+

People

+

Customers

+

Knowledge

+

History

+

Intelligence

The system should continuously learn from legitimate organizational
experience while preserving human authority over important decisions.

---

# 36. Roadmap Completion Principle

The roadmap is a guide, not a reason to build unnecessary features.

A phase should only be implemented when:

- The business need is clear.
- The preceding dependencies are stable.
- The user experience is understood.
- The financial and audit implications are understood.
- The implementation can be tested.

Project Atlas should grow deliberately rather than simply grow quickly.
