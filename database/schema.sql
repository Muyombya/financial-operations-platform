-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================
-- BRANCHES
-- =====================================

CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- TILLS
-- =====================================

CREATE TABLE tills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    branch_id UUID NOT NULL REFERENCES branches(id),

    name VARCHAR(100) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- USERS
-- =====================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,

    phone VARCHAR(30) NOT NULL UNIQUE,

    role VARCHAR(30) NOT NULL CHECK (
        role IN ('OWNER', 'SUPERVISOR', 'ATTENDANT')
    ),

    branch_id UUID REFERENCES branches(id),

    till_id UUID REFERENCES tills(id),

    password_hash TEXT NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- PROVIDERS
-- =====================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    code VARCHAR(50) NOT NULL UNIQUE,

    category VARCHAR(50) NOT NULL,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- =====================================
-- TILL SESSIONS
-- =====================================

CREATE TABLE till_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    business_date DATE NOT NULL,

    branch_id UUID NOT NULL REFERENCES branches(id),

    till_id UUID NOT NULL REFERENCES tills(id),

    opened_by UUID NOT NULL REFERENCES users(id),

    opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    closed_by UUID REFERENCES users(id),

    closed_at TIMESTAMP,

    status VARCHAR(20) NOT NULL CHECK (
        status IN (
            'PENDING',
            'OPEN',
            'CLOSING',
            'CLOSED'
        )
    ),

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (business_date, till_id)
);
-- =====================================
-- OPENING POSITIONS
-- =====================================

CREATE TABLE opening_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    session_id UUID NOT NULL REFERENCES till_sessions(id),

    provider_id UUID NOT NULL REFERENCES providers(id),

    opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (
        session_id,
        provider_id
    )
);
-- =====================================
-- POSITION SNAPSHOTS
-- =====================================

CREATE TABLE position_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    till_id UUID NOT NULL REFERENCES tills(id),

    provider_id UUID NOT NULL REFERENCES providers(id),

    current_balance NUMERIC(18,2) NOT NULL DEFAULT 0,

    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (
        till_id,
        provider_id
    )
);