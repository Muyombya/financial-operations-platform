# Project Atlas — API Specification

## Document Purpose

This document defines the application programming interface (API)
principles and business-facing endpoints for Project Atlas.

The API is the controlled boundary between user interfaces, mobile clients,
business engines, PostgreSQL and intelligence services.

The API must expose business actions rather than database implementation
details.

---

# 1. API Principles

Project Atlas APIs must:

- Use familiar business vocabulary.
- Validate business rules before changing financial state.
- Never allow clients to edit financial balances directly.
- Preserve historical records.
- Identify the authenticated user.
- Enforce company and branch access boundaries.
- Return predictable responses.
- Provide meaningful business errors.
- Support web and mobile clients.
- Be versioned so future changes do not silently break existing clients.

Initial API base:

`/api/v1`

---

# 2. Authentication

Authentication establishes who is operating Project Atlas.

The system must support:

- Company administrator authentication
- Manager authentication
- Supervisor authentication
- Attendant authentication

Authentication must produce an authenticated session or access token.

The backend must never trust branch, Till or staff identifiers supplied
by a client when those values can be derived from the authenticated user
and active assignment.

---

# 3. Authorization

Authorization determines what an authenticated user is allowed to do.

Access may depend on:

- Company
- Branch
- Role
- Staff assignment
- Till assignment
- Active session
- Specific business action
- Approval authority

Managers may have broader organizational access.

Attendants should receive only the access required for their assigned
operations.

Financial actions requiring authorization must be enforced by the backend,
not merely hidden in the interface.

---

# 4. Company

## Create Company

`POST /api/v1/companies`

Creates a company during the Organization Birth process.

Expected information may include:

- Company name
- Registration number
- TIN
- Phone
- Email
- Country
- Currency
- Time zone
- Address

Returns the created company.

---

## Get Company

`GET /api/v1/companies/:companyId`

Returns company information available to the authenticated user.

---

## Update Company

`PATCH /api/v1/companies/:companyId`

Updates permitted company configuration.

Important changes must be audited.

---

# 5. Branches

## List Branches

`GET /api/v1/branches`

Returns branches accessible to the authenticated user.

---

## Create Branch

`POST /api/v1/branches`

Creates a branch belonging to the authenticated company.

---

## Get Branch

`GET /api/v1/branches/:branchId`

Returns branch information and permitted operational summary.

---

## Update Branch

`PATCH /api/v1/branches/:branchId`

Updates permitted branch information.

---

## Retire Branch

`POST /api/v1/branches/:branchId/retire`

Retires a branch without destroying historical records.

---

# 6. Financial Pools

## List Financial Pools

`GET /api/v1/financial-pools`

Returns financial pools available within the company.

---

## Create Financial Pool

`POST /api/v1/financial-pools`

Creates a configured financial pool.

Examples:

- Operating Capital
- Expense Fund
- Salaries / Compensation
- Expansion
- Emergency

---

## Get Financial Pool

`GET /api/v1/financial-pools/:poolId`

Returns current status and permitted summary information.

---

## Fund Financial Pool

`POST /api/v1/financial-pools/:poolId/fund`

Records an authorized funding movement.

The API must create a movement rather than directly editing a balance.

---

# 7. Capital Movements

## List Movements

`GET /api/v1/movements`

Supports filtering by:

- Company
- Branch
- Till
- Service
- Financial pool
- User
- Movement type
- Date range
- Reference

---

## Create Movement

`POST /api/v1/movements`

Creates an authorized internal financial movement.

The request must specify the business movement being performed.

The backend determines whether the authenticated user is authorized.

---

## Get Movement

`GET /api/v1/movements/:movementId`

Returns the complete movement history.

---

## Reverse Movement

`POST /api/v1/movements/:movementId/reverse`

Creates a controlled reversal.

It must not rewrite or delete the original movement.

---

# 8. Tills

## List Tills

`GET /api/v1/tills`

Supports filtering by branch and status.

---

## Create Till

`POST /api/v1/tills`

Creates a Till.

The manager may specify:

- Till name
- Till type
- Purpose
- Policy

Till names must not be hardcoded.

---

## Get Till

`GET /api/v1/tills/:tillId`

Returns Till configuration and permitted current status.

---

## Update Till

`PATCH /api/v1/tills/:tillId`

Updates permitted Till configuration.

---

## Retire Till

`POST /api/v1/tills/:tillId/retire`

Retires a Till while preserving history.

A Till with historical activity must not be physically deleted.

---

# 9. Till Policies

## Get Till Policy

`GET /api/v1/tills/:tillId/policy`

Returns the policy governing the Till.

---

## Update Till Policy

`PATCH /api/v1/tills/:tillId/policy`

Updates authorized operational policy.

Examples:

- Inactivity timeout
- Allowed services
- Field operation
- Approval requirements

Specialized Tills may have policies different from ordinary Tills.

---

# 10. Services and Providers

## List Providers

`GET /api/v1/providers`

Returns configured service providers.

---

## Create Provider

`POST /api/v1/providers`

Creates a provider.

---

## List Services

`GET /api/v1/services`

Returns services available to the organization.

---

## Create Service

`POST /api/v1/services`

Creates a service associated with a provider where applicable.

---

# 11. Service Pool and Assignments

## List Available Services

`GET /api/v1/service-pool`

Returns services currently available for assignment.

---

## Assign Service

`POST /api/v1/tills/:tillId/services`

Assigns an available service to a Till.

The backend must verify:

- Service exists
- Till exists
- Both belong to the same company
- User is authorized
- Service is available for assignment

---

## Return Service to Pool

`POST /api/v1/tills/:tillId/services/:serviceId/release`

Returns a service to the Service Pool.

The assignment history remains available.

---

## Move Service

`POST /api/v1/services/:serviceId/move`

Moves a service from one Till to another where authorized.

This operation must preserve the previous assignment and create the new
assignment as one controlled business action.

---

## Service Assignment History

`GET /api/v1/services/:serviceId/assignments`

Returns the historical Till assignments for a service.

---

# 12. Staff Repository

## List Staff

`GET /api/v1/staff`

Returns staff within the authenticated company and permitted scope.

---

## Add Staff

`POST /api/v1/staff`

Adds a staff member to the company Staff Repository.

---

## Get Staff

`GET /api/v1/staff/:staffId`

Returns the staff member's permitted profile and organizational history.

---

## Update Staff

`PATCH /api/v1/staff/:staffId`

Updates permitted staff information.

---

# 13. Branch Staff Assignment

## Assign Staff to Branch

`POST /api/v1/branches/:branchId/staff`

Assigns an existing company staff member to a branch.

---

## Transfer Staff

`POST /api/v1/staff/:staffId/transfer`

Transfers a staff member from one branch to another.

The previous assignment must remain in history.

---

## Assignment History

`GET /api/v1/staff/:staffId/assignments`

Returns the staff member's historical branch assignments.

---

# 14. Till Access

A staff member may be authorized to operate a Till without becoming the
owner of that Till.

## Grant Till Access

`POST /api/v1/tills/:tillId/access`

Creates an authorized Till operating assignment.

---

## Revoke Till Access

`POST /api/v1/tills/:tillId/access/:staffId/revoke`

Removes current access while preserving history.

---

# 15. Till Sessions

## Open Till

`POST /api/v1/tills/:tillId/sessions/open`

Opens an operating session.

The backend must verify:

- Staff is authenticated
- Staff is authorized for the Till
- Staff belongs to the appropriate branch
- Till is active
- No conflicting session exists
- Required services and opening positions are configured

---

## Get Active Session

`GET /api/v1/tills/:tillId/sessions/active`

Returns the current active session where authorized.

---

## Logout / Close Session

`POST /api/v1/sessions/:sessionId/close`

Closes the session.

The backend records:

- Closing time
- Closing positions
- User
- Session status

---

## Step Away

`POST /api/v1/sessions/:sessionId/step-away`

Records that the attendant is temporarily leaving the Till.

A reason should be supplied where required.

---

## Return to Till

`POST /api/v1/sessions/:sessionId/return`

Records the attendant's return.

---

## Automatic Inactivity Logout

The backend may close or suspend an inactive session according to the
configured Till policy.

The result must identify that the action was automatic.

---

# 16. Opening Positions

## Set Opening Position

`POST /api/v1/sessions/:sessionId/opening-positions`

Records an authorized opening position.

The API must preserve the source of the opening position.

---

## Get Opening Positions

`GET /api/v1/sessions/:sessionId/opening-positions`

Returns the session's opening positions.

---

# 17. Closing Positions

## Record Closing Position

`POST /api/v1/sessions/:sessionId/closing-positions`

Records authorized closing positions.

---

## Get Closing Positions

`GET /api/v1/sessions/:sessionId/closing-positions`

Returns the session's closing positions.

---

# 18. Current Positions

## Get Till Positions

`GET /api/v1/tills/:tillId/positions`

Returns current service positions for the Till.

---

## Get Branch Positions

`GET /api/v1/branches/:branchId/positions`

Returns permitted current positions across the branch.

---

## Get Company Positions

`GET /api/v1/companies/:companyId/positions`

Returns permitted organizational financial positions.

---

# 19. Customers

## Search Customers

`GET /api/v1/customers/search`

Search may use:

- Phone number
- Account number
- Customer reference
- Name

Search access must follow privacy and authorization rules.

---

## Create Customer

`POST /api/v1/customers`

Creates a customer profile when appropriate.

The API should help prevent accidental duplicate customers.

---

## Get Customer

`GET /api/v1/customers/:customerId`

Returns permitted customer information.

---

## Customer History

`GET /api/v1/customers/:customerId/history`

Returns relevant transaction and service history available to the user.

---

# 20. Transactions

## Create Transaction

`POST /api/v1/transactions`

Creates a customer transaction.

The request must identify:

- Transaction type
- Amount
- Service
- Customer where applicable
- Agent identifier
- External reference where available

The authenticated staff member is recorded as the initiating user.

The backend must validate the active Till session and service assignment.

---

## Get Transaction

`GET /api/v1/transactions/:transactionId`

Returns the transaction and permitted related information.

---

## Search Transactions

`GET /api/v1/transactions`

Supports filtering by:

- Agent
- Branch
- Till
- Service
- Provider
- Customer
- Transaction type
- Date
- Status
- External reference

---

## Reverse Transaction

`POST /api/v1/transactions/:transactionId/reverse`

Creates a controlled reversal.

The original transaction remains available.

---

# 21. Agent Transactions

Transaction APIs must support agent-based reporting.

The initiating agent identifier is mandatory for applicable transactions.

The system must support:

`GET /api/v1/transactions?agentId=...`

This allows management to determine transaction counts and activity by
the agent who actually initiated the transactions.

---

# 22. Mtn Agents Float Operations

## Search Agent Customers

`GET /api/v1/float-agents/search`

Searches the customer records of agents served through the Mtn Agents
Float Till.

---

## Create Float Agent

`POST /api/v1/float-agents`

Creates or registers an MTN agent customer profile.

The agent number is mandatory.

---

## Record Float Sale

`POST /api/v1/float-agents/:agentId/float-sales`

Records a float transaction.

The transaction must preserve:

- Agent number
- Agent customer
- Initiating staff member
- Mtn Agents Float Till
- MTN service
- Amount
- Reference
- Date/time

---

## Agent History

`GET /api/v1/float-agents/:agentId/history`

Returns the permitted float activity history.

---

# 23. Expenses / Cash Book

## Get Expense Fund

`GET /api/v1/branches/:branchId/expense-fund`

Returns current Expense Fund information.

---

## Fund Expense Pool

`POST /api/v1/branches/:branchId/expense-fund/fund`

Records a replenishment.

It must not reduce operating capital unless an explicit authorized
movement is recorded.

---

## Record Expense

`POST /api/v1/branches/:branchId/expenses`

Records a branch expense.

Required information may include:

- Category
- Amount
- Description
- Reference
- Date

---

## List Expenses

`GET /api/v1/expenses`

Supports filtering by:

- Branch
- Category
- User
- Date range
- Amount

---

# 24. Compensation

The compensation API will be implemented as part of the People Growth
and Compensation Engine.

Potential endpoints include:

`GET /api/v1/compensation`

`POST /api/v1/compensation`

`GET /api/v1/staff/:staffId/compensation`

`POST /api/v1/compensation/:id/approve`

`POST /api/v1/compensation/:id/pay`

The final compensation workflow will be defined before implementation.

---

# 25. Knowledge

## Search Knowledge

`GET /api/v1/knowledge/search`

Supports semantic and structured retrieval.

---

## Create Knowledge

`POST /api/v1/knowledge`

Creates an organizational knowledge item.

---

## Approve Knowledge

`POST /api/v1/knowledge/:knowledgeId/approve`

Approves a knowledge item for organizational use.

---

## Knowledge Suggestions

`GET /api/v1/knowledge/suggestions`

May return relevant previous:

- Reasons
- Procedures
- Reminders
- Lessons
- Training content

The system must distinguish suggestions from mandatory instructions.

---

# 26. Learning

Potential endpoints:

`GET /api/v1/learning`

`POST /api/v1/learning`

`POST /api/v1/learning/:id/complete`

`GET /api/v1/staff/:staffId/learning`

Learning records must remain part of organizational history.

---

# 27. Audit

## Audit History

`GET /api/v1/audit`

Supports filtering by:

- User
- Branch
- Till
- Entity
- Action
- Date
- Reference

Audit access must follow authorization rules.

---

# 28. AI Recommendations

AI recommendations must be distinguishable from confirmed business
actions.

## Get Recommendations

`GET /api/v1/ai/recommendations`

---

## Get Recommendation

`GET /api/v1/ai/recommendations/:recommendationId`

---

## Accept Recommendation

`POST /api/v1/ai/recommendations/:recommendationId/accept`

Acceptance creates or authorizes the relevant business action.

---

## Reject Recommendation

`POST /api/v1/ai/recommendations/:recommendationId/reject`

Records the decision.

A rejection may optionally include a reason.

This creates useful organizational learning about AI recommendations.

---

# 29. API Error Model

API errors should use predictable structures.

Example:

```json
{
  "success": false,
  "error": {
    "code": "TILL_SESSION_REQUIRED",
    "message": "Open a Till session before performing this transaction."
  }
}
```

Business errors should use familiar language.

Technical database errors should not be exposed directly to users.

---

# 30. Success Response Model

A normal successful response may follow:

```json
{
  "success": true,
  "data": {}
}
```

Collections may include pagination information where appropriate.

---

# 31. Financial Safety

The following actions must never be implemented as direct balance updates
from the frontend:

- Funding
- Allocation
- Transfer
- Conversion
- Deposit
- Withdrawal
- Expense payment
- Compensation payment
- Adjustment

The frontend requests a business action.

The backend validates it.

The business engine performs it.

The database records the movement.

---

# 32. Idempotency

Financially significant API requests should support idempotency.

This prevents accidental duplicate processing when a mobile device retries
a request because of network instability.

This is especially important for:

- Customer transactions
- Transfers
- Float sales
- Funding
- Expense payments

---

# 33. Network Failure

The system must anticipate unreliable connectivity.

A client may submit a request and lose connectivity before receiving the
response.

The backend must therefore be able to determine whether a request was
already processed.

Client retry must not create a duplicate financial movement.

---

# 34. API and Business Engines

The API should remain relatively thin.

The intended flow is:

Client

→ API Route

→ Controller

→ Business Engine

→ Database

→ Audit

The controller should not contain complex financial rules.

Business rules belong in the appropriate engine or service layer.

---

# 35. API and AI

AI should not bypass the same business controls used by human users.

An AI recommendation must ultimately pass through the same authorization
and financial validation mechanisms.

AI may recommend.

The business engine validates.

An authorized human approves where required.

The system records the outcome.

---

# 36. Versioning

The initial API version is:

`/api/v1`

Breaking changes should result in a new API version rather than silently
changing the meaning of an existing endpoint.

---

# 37. API Principle

The API is not merely a bridge between React and PostgreSQL.

It is the controlled operational boundary of Project Atlas.

Every important business action must pass through a path where the system
can determine:

- Who is acting?
- What are they trying to do?
- Are they authorized?
- Is the business action valid?
- What changes?
- What financial movement occurs?
- What history must be preserved?
- What audit record must be created?

Only after those questions are satisfied should the operation be completed.
