-- ============================================================
-- Project Atlas
-- Migration 001: Organization Engine
-- ============================================================
--
-- Purpose:
-- Establish the platform's multi-company organizational foundation.
--
-- Scope:
--   companies
--   branches
--
-- This migration deliberately does NOT create:
--   tills
--   staff
--   services
--   financial pools
--   transactions
--
-- Those belong to later engines.
-- ============================================================

BEGIN;

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,

    registration_number VARCHAR(100),
    tin VARCHAR(100),

    phone VARCHAR(30),
    email VARCHAR(255),

    country VARCHAR(100) NOT NULL DEFAULT 'Uganda',
    currency_code CHAR(3) NOT NULL DEFAULT 'UGX',
    timezone VARCHAR(100) NOT NULL DEFAULT 'Africa/Kampala',

    address TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT companies_name_unique UNIQUE (name),
    CONSTRAINT companies_code_unique UNIQUE (code),
    CONSTRAINT companies_currency_code_check
        CHECK (currency_code ~ '^[A-Z]{3}$')
);

-- ============================================================
-- BRANCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL
        REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,

    location VARCHAR(200),
    address TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT branches_company_name_unique
        UNIQUE (company_id, name),

    CONSTRAINT branches_company_code_unique
        UNIQUE (company_id, code)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_branches_company_id
    ON branches(company_id);

CREATE INDEX IF NOT EXISTS idx_companies_is_active
    ON companies(is_active);

CREATE INDEX IF NOT EXISTS idx_branches_is_active
    ON branches(is_active);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS companies_set_updated_at ON companies;

CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS branches_set_updated_at ON branches;

CREATE TRIGGER branches_set_updated_at
BEFORE UPDATE ON branches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
