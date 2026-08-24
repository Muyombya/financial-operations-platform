# Project Atlas — Movement Rules

## Document Purpose

This document defines how financial and operational value is allowed to
move through Project Atlas.

The system must preserve the origin, destination, purpose, amount,
responsible user and history of important movements.

A balance represents a position.

A movement explains how that position changed.

---

# 1. General Movement Principle

Every material financial movement must have:

- A source
- A destination
- An amount
- A movement type
- A date and time
- An initiating user
- A business reason or purpose where applicable
- A reference where applicable

A movement must be traceable after completion.

---

# 2. Capital Movement Hierarchy

Operating capital normally follows this hierarchy:

Company

→ Branch

→ Till

→ Service

Capital may also move in the reverse direction when an authorized
reallocation or return occurs.

The system must preserve the complete movement path.

---

# 3. Company Funding

When the company receives additional operating capital:

Source:

External funding source

Destination:

Company Operating Capital

The movement must record:

- Amount
- Date/time
- Funding reference where applicable
- Responsible user
- Reason or narration

Additional funding increases the capital available for allocation.

---

# 4. Company-to-Branch Allocation

A company may allocate operating capital to a branch.

Example:

Company

→ Lubowa Branch

UGX 20,000,000

This is an allocation, not revenue.

The movement must identify:

- Company source
- Branch destination
- Amount
- Responsible user
- Date/time
- Reason
- Reference where applicable

The branch receives the allocated operating capital.

The company's available operating capital decreases by the allocated amount.

---

# 5. Branch-to-Till Allocation

A branch may allocate operating capital to a Till.

Example:

Lubowa Branch

→ Till Left

UGX 5,000,000

The movement must preserve the source branch and destination Till.

A Till allocation does not represent customer revenue.

It represents deployment of operating capital.

---

# 6. Till-to-Service Allocation

A Till may allocate working capital to a service assigned to that Till.

Example:

Till Left

→ MTN

UGX 2,000,000

The service becomes responsible for that working position during the
relevant operating period.

The movement must preserve:

- Till
- Service
- Amount
- Date/time
- Responsible user
- Reason
- Reference where applicable

---

# 7. Service-to-Till Reallocation

Working capital may be returned from a service position to the Till
for reallocation.

Example:

MTN

→ Till Left

UGX 500,000

The movement must not erase the previous service position.

It must create a new movement showing that capital was returned.

---

# 8. Till-to-Till Movement

Capital may be moved between Tills where business policy permits it.

Example:

Till Left

→ Till Right

UGX 1,000,000

The movement must identify:

- Source Till
- Destination Till
- Amount
- Responsible user
- Date/time
- Reason

Both positions must be updated as part of the same authorized operation.

---

# 9. Branch-to-Branch Movement

Operating capital may be transferred between branches when authorized.

Example:

Lubowa

→ Kitende

UGX 10,000,000

The movement must preserve both branches and the authorization history.

Branch-to-branch movement must not be treated as new company funding.

It is an internal reallocation.

---

# 10. Service-to-Service Conversion

A service conversion occurs when working capital changes from one provider
or service position to another.

Example:

MTN

→ Airtel

UGX 500,000

The movement must record:

- Source service
- Destination service
- Amount
- Date/time
- Responsible user
- Reason
- Reference where applicable

The original service position must decrease.

The destination service position must increase.

Both changes must succeed together.

---

# 11. Provider Conversion

Provider conversions may be recorded using the provider conversion
process.

Examples:

MTN

→ Airtel

MTN

→ Centenary

Airtel

→ Cash

The system must preserve the conversion as a historical movement.

A conversion must never simply overwrite a balance.

---

# 12. Customer Transaction Movement

Customer transactions are financial movements initiated by an authorized
agent or attendant.

Examples:

- Deposit
- Withdrawal
- Utility payment
- Float sale
- Other configured services

Every transaction must identify the initiating agent or attendant.

The agent identifier is mandatory.

Transaction reporting must therefore be possible by:

- Agent
- Till
- Branch
- Service
- Provider
- Date
- Transaction type

---

# 13. Customer Deposit

For a deposit:

Customer

→ Till/Service

The transaction must record the customer reference and initiating agent.

The service position must reflect the corresponding operational effect.

---

# 14. Customer Withdrawal

For a withdrawal:

Till/Service

→ Customer

The transaction must identify the initiating agent.

The service position must reflect the corresponding operational effect.

---

# 15. Float Distribution

The Mtn Agents Float Till is a specialized Till.

Its customers are MTN agents receiving float.

A float distribution movement must identify:

- Receiving agent
- Agent number
- Initiating staff member
- Till
- Service
- Amount
- Date/time
- Reference

The agent number is mandatory.

The system must preserve the agent's transaction history.

---

# 16. Mtn Agents Float Till

The Mtn Agents Float Till operates under policies that may differ from
ordinary retail Tills.

It may operate as a field or roving Till.

Its transactions may occur outside the physical branch.

The Till must nevertheless retain:

- Assigned branch
- Current operator
- Service positions
- Session history
- Agent customer history
- Daily closing position

---

# 17. Expense Fund Movement

The Expense Fund is independent of operating capital.

A branch Expense Fund may receive a top-up.

Example:

Expense Funding Source

→ Lubowa Expense Fund

UGX 1,000,000

This must not reduce the branch's operating capital.

---

# 18. Expense Payment

An expense payment moves value from the branch Expense Fund to an
approved expense.

Example:

Lubowa Expense Fund

→ Fuel Expense

UGX 200,000

The movement must record:

- Branch
- Expense category
- Amount
- Date/time
- Responsible user
- Description
- Reference where applicable

---

# 19. Expense Fund Replenishment

When an Expense Fund approaches exhaustion, management may replenish it.

The system must preserve the replenishment as a separate movement.

The replenishment must not be confused with operating capital allocation.

---

# 20. Salary and Compensation Funding

Salary and compensation may be funded through a dedicated compensation
financial pool.

Funding the compensation pool is separate from recording the eventual
employee compensation.

Example:

Company

→ Salaries / Compensation Pool

UGX 20,000,000

Later:

Compensation Pool

→ Employee

Salary Payment

The two movements must remain separately traceable.

---

# 21. Capital Pool Transfers

Where multiple financial pools exist, movement between pools requires
explicit authorization.

Examples:

Operating Capital

→ Expansion Pool

Expense Pool

→ Emergency Pool

Such movements must record:

- Source pool
- Destination pool
- Amount
- Reason
- Responsible user
- Date/time
- Authorization where required

Funds must never appear to move between pools simply because a balance
was edited.

---

# 22. Adjustments

An adjustment is not a normal movement.

Adjustments are permitted only for authorized corrections.

Every adjustment must record:

- Original position
- Corrected position
- Difference
- Reason
- Responsible user
- Date/time
- Authorization where required

The original history must remain available.

---

# 23. Actual Position

The system position and actual physical position may differ.

Where the business permits a supervisor or authorized manager to record
an actual position:

The system must preserve:

- System position
- Actual position
- Difference
- Reason
- Person making the adjustment
- Date/time

An actual-position adjustment must always create an audit record.

---

# 24. Atomicity of Financial Movements

A financial movement involving multiple positions must be completed as
one atomic operation.

Example:

Till Left

→ Till Right

UGX 1,000,000

The system must either:

1. Deduct UGX 1,000,000 from Till Left and add UGX 1,000,000 to Till Right,

or:

2. Make no change.

Partial completion is not acceptable.

---

# 25. No Silent Balance Editing

Balances must not normally be edited directly.

A balance changes because of a recorded movement.

If an exceptional correction is required, it must use an authorized
adjustment process.

---

# 26. Movement Immutability

Completed financial movements must not be silently deleted or rewritten.

If a completed movement is found to be incorrect:

- Void
- Reverse
- Correct
- Adjust

using an appropriate controlled process.

The original movement must remain part of history.

---

# 27. Movement References

Where an external provider supplies a transaction or reference number,
Project Atlas should preserve it.

Examples:

- Provider transaction ID
- Agent transaction number
- Bank reference
- Customer reference
- Internal reference

External references should not replace the internal Atlas movement ID.

Both may be required.

---

# 28. Movement Reason

Movements that require explanation must contain a reason.

Reasons should be searchable.

Where a user enters a reason similar to a previous reason, Project Atlas
may suggest previously recorded reasons.

The suggestion must never prevent the user from entering a genuinely new
reason.

---

# 29. Movement Audit

Important movements must generate an audit trail.

The audit record should identify:

- Who initiated the movement
- What moved
- From where
- To where
- Amount
- When it happened
- Reason
- Result
- Related session
- Related transaction where applicable

---

# 30. AI and Movement Intelligence

AI may analyze movement history to identify:

- Unusual transfers
- Repeated reallocations
- Service shortages
- Excessive idle positions
- Unexpected expense patterns
- Branch funding requirements
- Till funding requirements
- Provider demand patterns
- Float distribution opportunities

AI recommendations must not automatically execute irreversible financial
movements.

Authorized human approval remains required.

---

# 31. Core Movement Principle

Project Atlas must always be able to answer:

> Where did the value come from?

> Where did it go?

> How much moved?

> Why did it move?

> Who authorized or initiated it?

> When did it happen?

> What was the position before?

> What was the position after?

> What happened next?

If the system cannot answer these questions, the movement model is
incomplete.