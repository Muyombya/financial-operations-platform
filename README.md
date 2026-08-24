# Project Atlas — Organization Engine

This package adds the first business logic layer to the Project Atlas backend.

## Endpoints

### Companies

- `GET /api/v1/companies`
- `POST /api/v1/companies`
- `GET /api/v1/companies/:companyId`

### Branches

- `GET /api/v1/companies/:companyId/branches`
- `POST /api/v1/companies/:companyId/branches`

## Example: Create Company

```json
{
  "name": "GadgetShop Uganda",
  "code": "GADGETSHOP",
  "country": "Uganda",
  "currencyCode": "UGX",
  "timezone": "Africa/Kampala"
}
```

## Example: Create Branch

```json
{
  "name": "Lubowa",
  "code": "LUBOWA",
  "location": "Lubowa"
}
```

The service layer uses parameterized PostgreSQL queries and the database
constraints remain authoritative for uniqueness and relationships.
