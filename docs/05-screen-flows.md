# Project Atlas — Screen Flows

## Document Purpose

This document defines the primary user journeys for Project Atlas.

The purpose is to ensure that the interface follows the way the business
actually operates.

The screen flows describe what users experience.

They do not define database implementation.

---

# 1. Screen Design Principles

Project Atlas screens must:

- Use familiar business vocabulary.
- Keep important actions obvious.
- Minimize unnecessary steps.
- Prevent avoidable financial mistakes.
- Explain what the system is doing.
- Show relevant context before consequential actions.
- Preserve historical information.
- Provide useful intelligence without overwhelming users.

The interface must not require users to understand the technical
architecture.

---

# 2. Organization Birth Flow

## Purpose

Create a company and prepare it for operation.

## Flow

Welcome

↓

Begin Setup

↓

Company Information

↓

Business Configuration

↓

Branch Creation

↓

Financial Pools

↓

Service Providers

↓

Services

↓

Till Birth

↓

Service Assignment

↓

Staff Repository

↓

Administrator Setup

↓

Organization Summary

↓

Enter Project Atlas

---

# 3. Company Information

The setup screen collects:

- Company name
- Registration information
- TIN where applicable
- Phone
- Email
- Country
- Currency
- Time zone
- Address

The user should be able to review the information before continuing.

---

# 4. Branch Birth

The manager creates the first branch.

Information may include:

- Branch name
- Branch code
- Location
- Address
- Working hours
- Operational settings

After creation, the branch becomes available for further configuration.

---

# 5. Financial Pool Setup

The setup process presents the organization's financial pools.

Examples:

- Operating Capital
- Expense Fund
- Salaries / Compensation
- Expansion
- Emergency

The user enters initial funding or allocation information where required.

The system should show:

Total Available

Total Allocated

Remaining

The system should warn when the organization's configured capital policy
has not been satisfied.

---

# 6. Service Provider Setup

Management can add providers.

Examples:

- MTN
- Airtel
- Centenary Bank
- Equity Bank
- Stanbic Bank
- DFCU Bank
- Absa Bank

Providers should be configurable rather than hardcoded.

---

# 7. Service Setup

Management creates the services the company offers.

A service may include:

- Service name
- Provider
- Category
- Description
- Operating rules

The service becomes available in the Service Pool.

---

# 8. Till Birth

## Purpose

Create an operational Till.

## Flow

Tills

↓

Create Till

↓

Till Name

↓

Till Type

↓

Purpose

↓

Operational Policy

↓

Initial Configuration

↓

Assign Services

↓

Confirm Till

↓

Till Created

Till names are selected by management.

The system must not impose names such as Left, Right or Middle.

---

# 9. Service Assignment

After a Till is created, management can assign services.

The screen shows:

## Available Services

Services currently in the Service Pool.

## Assigned Services

Services already assigned to the Till.

The user can:

- Assign
- Remove
- Move

A service removed from a Till returns to the Service Pool.

---

# 10. Moving a Service

## Flow

Service Pool / Current Till

↓

Select Service

↓

Move Service

↓

Select Destination Till

↓

Enter Reason

↓

Confirm

↓

Service moved

The system must show the previous Till and new Till before confirmation.

---

# 11. Staff Repository

## Purpose

Register employees centrally.

## Flow

Staff Repository

↓

Add Staff

↓

Staff Information

↓

Role

↓

Employment Status

↓

Save

The staff member becomes part of the company's permanent organizational
history.

---

# 12. Assign Staff to Branch

## Flow

Staff Repository

↓

Select Staff

↓

Assign to Branch

↓

Select Branch

↓

Set Assignment

↓

Confirm

The staff member now belongs operationally to that branch until transferred.

---

# 13. Till Access

A staff member may be authorized to operate one or more Tills according to
business policy.

## Flow

Staff

↓

Till Access

↓

Select Till

↓

Grant Access

↓

Confirm

The Till remains owned by the organization.

The staff member only receives operating access.

---

# 14. First Till Login

When a staff member is assigned to operate a Till for the first time:

Login

↓

Select Branch

↓

Select Till

↓

Create Till Credentials if required

↓

Confirm

↓

Enter Till

The staff member's Till credentials remain associated with their access
history, not with ownership of the Till.

---

# 15. Till Opening

## Flow

Select Till

↓

Open Till

↓

Confirm Attendant

↓

Review Services

↓

Review Opening Positions

↓

Enter or Confirm Opening Positions

↓

Confirm

↓

Till Active

The system should clearly display:

- Till name
- Attendant
- Business date
- Services
- Opening positions

---

# 16. Active Till

The active Till screen is the primary working environment for an attendant.

It should provide quick access to:

- New Transaction
- Customer Search
- Till Position
- Services
- Transfers where authorized
- Step Away
- Till History
- Help / Knowledge

The interface should prioritize speed during customer service.

---

# 17. Customer Transaction

## Flow

New Transaction

↓

Select Service

↓

Identify Customer

↓

Enter Transaction Details

↓

Confirm Amount

↓

Confirm Customer Information

↓

Confirm Transaction

↓

Transaction Complete

↓

Updated Position

The system should minimize repeated entry for returning customers.

---

# 18. Returning Customer

## Flow

Customer Search

↓

Enter Phone / Account Number / Name

↓

Customer Found

↓

Display Relevant Customer Information

↓

Select Customer

↓

New Transaction

The system may show useful prior history such as:

- Previous services used
- Recent visit
- Relevant customer preferences
- Previous transaction activity

Only information appropriate to the user's role should be shown.

---

# 19. Customer Memory

When a returning customer is recognized, the attendant may receive a
simple contextual message.

Example:

> Welcome back, Martin.

or:

> Customer previously used MTN deposits and utility payments.

The purpose is to improve familiarity and service speed.

The system should not expose unnecessary or sensitive information.

---

# 20. Transaction Confirmation

Before completing a financial transaction, the screen should show:

- Customer
- Service
- Amount
- Agent / attendant
- Till
- Relevant reference

The user confirms the action.

The backend then validates and completes the transaction.

---

# 21. Agent Identifier

For applicable transactions, the agent number must be visible or otherwise
clearly associated with the transaction process.

The initiating agent identifier is mandatory.

Transaction reporting must later be possible by agent.

---

# 22. Stepping Away

An attendant should not simply walk away from an active Till.

## Flow

Active Till

↓

Step Away

↓

Select Reason

Examples:

- Lunch
- Short Break
- Customer Assistance
- Supervisor Request
- Other

↓

Confirm

↓

Till Locked / Session Suspended

The system records the time.

---

# 23. Automatic Inactivity Logout

If an attendant walks away without using Step Away:

The system detects inactivity.

↓

Configured timeout reached

↓

Automatic logout / session protection

↓

Record automatic action

↓

Till becomes unavailable for unauthorized use

The initial proposed default is five minutes.

The timeout must be configurable by policy.

---

# 24. Returning From Break

## Flow

Till

↓

Resume / Login

↓

Authenticate

↓

Return to Active Till

The system records the return time.

The duration away can then be measured.

---

# 25. Till Position

The attendant should be able to view the current working position for
authorized services.

Example:

```text
MTN
Opening:       2,000,000
Movements:      -500,000
Current:       1,500,000
```

The interface should emphasize current position while allowing access to
history.

---

# 26. Till-to-Till Transfer

## Flow

Till

↓

Transfer

↓

Select Destination Till

↓

Select Service / Position

↓

Enter Amount

↓

Enter Reason

↓

Review

↓

Confirm

↓

Transfer Complete

Both sides of the movement must update together.

---

# 27. Branch-to-Branch Transfer

Authorized managers or supervisors can initiate branch transfers.

## Flow

Branch

↓

Transfer

↓

Select Destination Branch

↓

Select Source Position

↓

Enter Amount

↓

Reason

↓

Review

↓

Authorization

↓

Complete

The system preserves the complete transfer history.

---

# 28. Service-to-Service Conversion

## Flow

Select Source Service

↓

Select Destination Service

↓

Enter Amount

↓

Reason

↓

Review

↓

Confirm

↓

Conversion Complete

Both service positions update together.

---

# 29. Expense / Cash Book

## Flow

Branch

↓

Cash Book

↓

Current Fund Position

↓

Record Expense

↓

Select Category

↓

Enter Amount

↓

Enter Description

↓

Attach Reference where applicable

↓

Confirm

The expense reduces the Expense Fund, not operating capital.

---

# 30. Expense Fund Top-Up

## Flow

Cash Book

↓

Fund / Top Up

↓

Enter Amount

↓

Source

↓

Reason

↓

Confirm

The replenishment is recorded separately from expense transactions.

---

# 31. Actual Position

When the system position differs from the actual observed position:

## Flow

Position

↓

Actual Position

↓

Enter Actual Amount

↓

System Shows Difference

↓

Enter Reason

↓

Supervisor / Authorized User Approval

↓

Confirm

The system preserves both positions and the adjustment history.

---

# 32. Mtn Agents Float Till

The specialized Till provides a different operating flow.

## Flow

Open Mtn Agents Float Till

↓

Identify MTN Agent

↓

Search Existing Agent

or

Register Agent

↓

Confirm Agent Number

↓

Select Float Service

↓

Enter Amount

↓

Confirm

↓

Record Float Sale

↓

Update Agent History

↓

Update Till Position

---

# 33. Field / Roving Operation

The Mtn Agents Float Till may operate away from the physical branch.

The system should continue to associate activity with:

- Mother branch
- Specialized Till
- Staff member
- Agent customer
- Service
- Session

Network interruption must not cause duplicate financial transactions when
the client retries a request.

---

# 34. Session Closing

## Flow

Active Till

↓

Close Till

↓

Review Transactions

↓

Review Service Positions

↓

Enter / Confirm Closing Positions

↓

Review Differences

↓

Provide Reasons where required

↓

Confirm Closing

↓

Till Closed

The system preserves the complete session history.

---

# 35. Difference Handling

If opening position + movements does not agree with closing position:

The system should display the difference clearly.

Example:

```text
Expected:       UGX 5,000,000
Actual:         UGX 4,950,000
Difference:     -UGX 50,000
```

The system should request an explanation or authorized adjustment where
business policy requires one.

---

# 36. Manager Dashboard

The manager dashboard should summarize:

- Branch performance
- Till activity
- Current positions
- Capital allocations
- Expense position
- Staff activity
- Transaction activity
- Service performance
- Exceptions
- AI recommendations

The dashboard should emphasize what requires attention rather than merely
displaying large quantities of data.

---

# 37. Daily Intelligence

The Daily Intelligence area may communicate:

- What happened
- What changed
- What requires attention
- Why it may have happened
- What the system recommends

The system should prefer specific operational insights over generic
statements.

Example:

Instead of:

> 8 models are low stock.

Prefer:

> MTN position at Kitende has fallen below the normal Friday working
> level. Consider reallocating UGX 2,000,000 from Naalya Upper.

---

# 38. Knowledge and Learning

When staff log in, the system may present relevant reminders.

Example:

> Today's routine: confirm customer phone numbers before completing
> deposits.

Knowledge may be scoped to:

- Company
- Branch
- Till
- Service
- Role

---

# 39. Reason Suggestions

When a user is entering a reason:

Reason

↓

System searches previous reasons

↓

Similar reasons displayed

↓

User may select one

or

↓

Enter a new reason

The system must never force reuse of an old reason.

---

# 40. AI Recommendation Flow

## Flow

AI identifies pattern

↓

AI creates recommendation

↓

Manager reviews

↓

System explains reasoning

↓

Manager accepts / rejects / postpones

↓

Decision recorded

↓

Outcome observed later

This allows Project Atlas to learn whether recommendations were useful.

---

# 41. Staff Growth

A staff member should eventually be able to see:

- Learning progress
- Required routines
- Completed training
- Recognition
- Development goals
- Useful feedback

Managers should see broader development information according to their
authority.

---

# 42. Manager Staff Development

## Flow

Manager

↓

Staff

↓

Select Staff Member

↓

View Growth Profile

↓

Review:

- Learning
- Performance
- Attendance
- Customer service
- Contributions
- Development opportunities

↓

Assign Coaching / Learning

---

# 43. Organization Knowledge

Managers should be able to capture knowledge such as:

- Procedures
- Rules
- Lessons
- Customer service practices
- Training material
- Operational reminders

Knowledge should have a clear scope and approval state.

---

# 44. Audit Review

Managers and authorized users can review significant activity.

## Flow

Audit

↓

Filter by:

- Branch
- Till
- User
- Action
- Date
- Reference

↓

Review Event

↓

View Before / After

↓

View Reason

↓

View Related Movement / Transaction

---

# 45. Network Failure Experience

When network connectivity is interrupted:

The user should receive a clear message such as:

> Connection unavailable. Your transaction has not yet been confirmed.

The client must not falsely display a successful financial transaction.

When connectivity returns, a safe retry mechanism may submit the operation
using its idempotency identity.

The user should be able to determine whether the transaction was:

- Confirmed
- Pending
- Failed
- Already processed

---

# 46. Error Handling

User-facing errors should explain what the user can do next.

Avoid technical messages such as:

> Foreign key violation.

Prefer:

> This Till cannot be removed because it has operational history.

Avoid:

> Unique constraint violation.

Prefer:

> A Till with this name already exists in this branch.

---

# 47. Mobile Experience

Attendants should be able to perform core operations comfortably on a phone.

Priority operations include:

- Login
- Select Till
- Open Till
- Customer search
- Transaction
- Position
- Step Away
- Resume
- Close Till

The interface should minimize typing during customer service.

---

# 48. Manager Experience

Managers require broader organizational visibility.

Priority areas include:

- Company
- Branches
- Tills
- Capital
- Services
- Staff
- Expenses
- Reports
- Audit
- Knowledge
- AI recommendations

---

# 49. Screen Vocabulary

User interfaces should use business language.

Prefer:

- Open Till
- Close Till
- Step Away
- Return
- Transfer
- Assign Service
- Return Service
- Record Expense
- Opening Balance
- Closing Balance
- Cash Book
- Customer
- Reason

Avoid exposing unnecessary technical language.

---

# 50. Screen Flow Principle

Every important screen should answer three questions:

1. Where am I?

2. What am I doing?

3. What will happen if I confirm this?

Financial actions should always provide a clear review before completion.

Project Atlas should make the correct action easy and the dangerous action
difficult.

---

# 51. Core User Experience Principle

The system must fit the user into the organization's operating model.

Users do not redefine the organization every time they log in.

The organization provides:

- Branch
- Till
- Services
- Policies
- Knowledge
- Responsibilities

The employee operates within that structure and contributes to its
continuous improvement.

That principle is fundamental to Project Atlas.
