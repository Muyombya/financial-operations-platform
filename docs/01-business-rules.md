# Project Atlas — Business Rules

## Document Purpose

This document defines the business rules that govern Project Atlas.

These rules represent the operational reality of the business and are
the foundation upon which the database, backend, frontend and intelligence
engines are built.

Technical implementation must not contradict these rules.

---

# 1. Organization

## 1.1 Company

A company is the highest organizational level in Project Atlas.

A company may operate one or more branches.

A company owns the organization's operating capital and other financial pools.

A company also owns the Staff Repository and organizational knowledge.

---

## 1.2 Branch

A branch belongs to one company.

A company may have multiple branches.

A branch has its own:

- Operating capital allocation
- Expense fund
- Tills
- Staff assignments
- Operating sessions
- Operational history

A branch may receive additional operating capital from the company.

---

# 2. Operating Capital

## 2.1 Company Operating Capital

Operating capital belongs to the company.

Operating capital is intended to remain operationally deployed.

The company does not intentionally maintain idle operating capital.

When additional funding is received, it becomes available for allocation.

---

## 2.2 Capital Allocation

Operating capital moves through an organizational hierarchy:

Company

→ Branch

→ Till

→ Service

Capital allocation must preserve the origin and destination of the capital.

Every allocation must have:

- Source
- Destination
- Amount
- Date/time
- Responsible user
- Reason or purpose
- Reference where applicable

---

## 2.3 Branch Operating Capital

A branch receives operating capital from the company.

The branch distributes its operating capital among its Tills according to operational requirements.

---

## 2.4 Till Operating Capital

A Till receives operating capital from its branch.

A Till may distribute working capital among the services assigned to it.

---

## 2.5 Service Working Capital

A service operating on a Till has its own working position.

Examples include:

- MTN
- Airtel
- Centenary Bank
- Cash
- Other configured services

The system must be able to determine the working position of each service.

---

# 3. Opening and Closing Positions

## 3.1 Opening Position

An opening position represents the working capital available to a service when a Till operating session begins.

An opening position may originate from:

- The previous session's closing position
- A new allocation
- A transfer
- An authorized adjustment

Opening position must not be treated as merely a copied number.

Its source must remain traceable.

---

## 3.2 Closing Position

A closing position represents the service's position when the Till session is closed.

Closing positions must be preserved historically.

A closed position must not be silently overwritten.

---

## 3.3 Position Continuity

Where operational policy requires it, a service's closing position may become the basis for its next opening position.

Any difference between the previous closing position and the next opening position must be explainable through an authorized movement or adjustment.

---

# 4. Tills

## 4.1 Till Identity

A Till belongs to the organization through its branch.

A Till is not permanently owned by an individual employee.

Till identity must remain independent of the person currently operating it.

---

## 4.2 Till Naming

Till names are created by management.

Till names must not be hardcoded into the system.

Examples may include:

- Till Left
- Till Right
- Till Middle
- Main Counter
- Mtn Agents Float Till

---

## 4.3 Till Birth

A Till is created through a controlled Till creation process.

When a Till is created, management may define:

- Till name
- Till type
- Purpose
- Operating policies
- Assigned services

---

## 4.4 Till Retirement

A Till must not be deleted when it has operational history.

Where a Till is no longer required, it should be deactivated or retired while preserving its historical records.

---

# 5. Service Pool

## 5.1 Service Ownership

Services offered by the company belong to the company's Service Pool before being assigned to a Till.

---

## 5.2 Service Assignment

A service may be assigned to a Till.

A service may be returned to the Service Pool.

A service may subsequently be assigned to another Till.

Services must therefore be mobile between Tills within the branch.

---

## 5.3 Service Mobility

Moving a service between Tills must preserve:

- Previous Till
- New Till
- Date/time
- Responsible user
- Reason
- Assignment history

A service must not appear simultaneously as actively assigned to multiple Tills unless the business explicitly supports multiple independent service instances.

---

# 6. Staff Repository

## 6.1 Staff Ownership

Employees belong to the company's Staff Repository.

A staff member is not permanently owned by a branch.

---

## 6.2 Branch Assignment

A staff member may be assigned to a branch.

A staff member may later be transferred to another branch.

Previous branch assignments must remain part of the employee's history.

---

## 6.3 Till Operation

A staff member selects the Till they are authorized to operate.

The Till remains organizationally independent of the employee.

---

## 6.4 Staff Departure

Removing an employee from active employment must not delete their historical operational records.

The company retains their documented history and organizational knowledge.

---

# 7. Till Sessions

## 7.1 Session Ownership

A Till operates through controlled operating sessions.

A session identifies:

- Business date
- Branch
- Till
- Attendant
- Opening position
- Closing position
- Opening time
- Closing time
- Session status

---

## 7.2 Active Session

Only authorized staff may operate an active Till session.

A Till must not have conflicting active sessions.

---

## 7.3 Stepping Away

An attendant should log out when stepping away from an active Till.

The attendant should provide a reason for leaving.

If an attendant fails to log out, the system may automatically end the active Till session after a configurable inactivity period.

The default proposed inactivity period is five minutes.

---

# 8. Transactions

## 8.1 Transaction Origin

Every transaction must identify the agent or attendant who initiated it.

The initiating agent identifier is mandatory.

Transaction counting and operational analysis must be possible by initiating agent.

---

## 8.2 Transaction Identity

Every transaction must have a unique system identifier.

Provider transaction references should be preserved where available.

---

## 8.3 Transaction History

Completed transactions must not be silently deleted.

Corrections, voids or reversals must preserve the original transaction history.

---

# 9. Expense Fund / Cash Book

## 9.1 Independence

Branch operating expenses are funded through a separate Expense Fund, commonly referred to by the business as the Cash Book.

The Expense Fund does not form part of the branch's operating capital.

---

## 9.2 Expense Funding

The Expense Fund receives additional funding when required.

The fund is replenished independently from operating capital.

---

## 9.3 Expense Recording

Every expense must record:

- Branch
- Expense category
- Amount
- Date/time
- Responsible user
- Description
- Reference where applicable

---

## 9.4 Expense Categories

Expense categories must be configurable.

Examples include:

- Fuel
- Electricity
- Internet
- Cleaning
- Maintenance
- Stationery
- Security
- Utilities
- Other approved expenses

---

## 9.5 Expense Reporting

Management must be able to review expenditure by:

- Branch
- Category
- Period
- User
- Amount

Historical expenses must remain available for reporting and intelligence.

---

# 10. Customer Memory

## 10.1 Customer Recognition

The system should preserve useful customer information from previous transactions.

Where permitted and appropriate, attendants should be able to retrieve a returning customer's information using available identifiers such as:

- Phone number
- Customer reference
- Name

---

## 10.2 Customer History

The system should provide authorized staff with relevant transaction history to improve service continuity.

Customer information must be handled according to applicable privacy and access rules.

---

# 11. Organizational Knowledge

## 11.1 Knowledge Ownership

Organizational knowledge belongs to the company, not an individual employee.

---

## 11.2 Knowledge Sources

Knowledge may originate from:

- Managers
- Supervisors
- Employees
- Operational experience
- Approved AI recommendations
- Historical business patterns

---

## 11.3 Knowledge Preservation

When an employee leaves the company, approved knowledge they contributed remains with the organization.

---

## 11.4 Knowledge Suggestions

When an employee enters a reason, explanation or "Why", the system may present previously recorded similar reasons.

The system should avoid forcing the employee to reuse an old reason when the situation is genuinely different.

---

## 11.5 Knowledge Distribution

Knowledge may apply to:

- Entire company
- Branch
- Till
- Service
- Staff role
- Specific learning group

---

# 12. People Development

Project Atlas should help employees grow, not merely record their work.

The system may track:

- Training
- Knowledge completion
- Operational performance
- Customer service performance
- Attendance patterns
- Contributions
- Recognition
- Career development

Performance information should support coaching and development.

---

# 13. Financial Pools

Financial pools may exist for different operational purposes.

Examples include:

- Operating Capital
- Expense Fund
- Salaries / Compensation
- Expansion
- Emergency Funding

Each financial pool must have a defined purpose.

Funds must not be mixed without an explicitly recorded and authorized movement.

---

# 14. Salaries and Compensation

Salaries are an operating expense from an accounting perspective.

However, operationally they require their own controlled process because compensation may involve:

- Salary
- Allowances
- Commissions
- Bonuses
- Overtime
- Deductions
- Advances
- Other approved compensation elements

Compensation must preserve its relationship to the employee and applicable organizational rules.

---

# 15. AI Governance

AI is a core capability of Project Atlas.

AI may:

- Analyze operational patterns
- Identify anomalies
- Recommend actions
- Explain business trends
- Assist with training
- Suggest knowledge
- Support customer service
- Assist management decisions
- Forecast operational requirements

AI must not independently perform irreversible financial actions without appropriate human authorization.

AI recommendations must remain distinguishable from confirmed human decisions.

---

# 16. Auditability

Important operational and financial actions must be traceable.

The system should preserve:

- Who performed the action
- What changed
- When it changed
- Previous value where applicable
- New value where applicable
- Reason
- Related transaction or reference

Historical records must not be silently overwritten.

---

# 17. Business Vocabulary

Project Atlas must use terminology familiar to its users.

Technical terminology should not unnecessarily appear in the user interface.

Examples:

Prefer:

- Till
- Service
- Opening Balance
- Closing Balance
- Cash Book
- Float
- Branch
- Attendant
- Manager
- Customer
- Transfer
- Reason

Avoid exposing technical terms such as:

- Service Endpoint
- Entity
- Payload
- Record Mutation
- API Resource

Technical terminology may remain inside the engineering layer where necessary.

---

# 18. Core Principle

Project Atlas exists to:

1. Preserve operational knowledge.
2. Improve operational performance.
3. Improve customer experience.
4. Develop people.
5. Maintain financial visibility.
6. Help management make better decisions.
7. Continuously learn from business experience.

The system must be designed so that business history becomes an organizational asset rather than disposable data.