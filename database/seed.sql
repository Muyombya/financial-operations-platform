-- =====================================
-- BRANCHES
-- =====================================

INSERT INTO branches (name)
VALUES
('Lubowa'),
('Kitende'),
('Naalya Lower'),
('Naalya Upper');

-- =====================================
-- PROVIDERS
-- =====================================

INSERT INTO providers (name, code, category)
VALUES
('Cash', 'CASH', 'SYSTEM'),

('MTN', 'MTN', 'MOBILE_MONEY'),
('Airtel', 'AIRTEL', 'MOBILE_MONEY'),

('Centenary Bank', 'CENTENARY', 'BANK'),
('Equity Bank', 'EQUITY', 'BANK'),
('Stanbic Bank', 'STANBIC', 'BANK'),
('DFCU Bank', 'DFCU', 'BANK'),
('Absa Bank', 'ABSA', 'BANK');
