-- ============================================================
-- migration_001_enums_and_indexes.sql
-- Elite Hardware POS — hardening migration
--
-- Run this once against your Supabase database.
-- Safe to re-run: all statements use IF NOT EXISTS / DO blocks.
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. ENUMS
--    Replaces free-text role and payment_status with proper
--    enums so typos like "Admin" can't slip through at the DB level.
-- ────────────────────────────────────────────────────────────

-- Employee role enum
DO $$ BEGIN
    CREATE TYPE employee_role AS ENUM ('admin', 'manager', 'cashier');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Migrate existing text values → lowercase, then change column type
UPDATE employees SET role = LOWER(TRIM(role));

ALTER TABLE employees
    ALTER COLUMN role TYPE employee_role
    USING role::employee_role;

-- Payment status enum (covers all values used in application code)
DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM (
        'Paid', 'Credit', 'Partial', 'Unpaid'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Normalise existing rows to title-case before converting
UPDATE "Sales" SET payment_status =
    CASE LOWER(TRIM(payment_status))
        WHEN 'paid'    THEN 'Paid'
        WHEN 'credit'  THEN 'Credit'
        WHEN 'partial' THEN 'Partial'
        WHEN 'unpaid'  THEN 'Unpaid'
        ELSE payment_status   -- leave unknown values unchanged
    END;

ALTER TABLE "Sales"
    ALTER COLUMN payment_status TYPE payment_status_type
    USING payment_status::payment_status_type;

-- ────────────────────────────────────────────────────────────
-- 2. MISSING COLUMNS
--    Ensure columns added by application code actually exist.
-- ────────────────────────────────────────────────────────────

ALTER TABLE "Sales"
    ADD COLUMN IF NOT EXISTS is_voided    BOOLEAN  DEFAULT false,
    ADD COLUMN IF NOT EXISTS receipt_number TEXT,
    ADD COLUMN IF NOT EXISTS invoice_number TEXT,
    ADD COLUMN IF NOT EXISTS dn_number      TEXT;

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ────────────────────────────────────────────────────────────
-- 3. INDEXES
--    Speed up the most common query patterns.
-- ────────────────────────────────────────────────────────────

-- Sales queries (sale_date range scans are the most frequent)
CREATE INDEX IF NOT EXISTS idx_sales_sale_date
    ON "Sales"(sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_sales_payment_status
    ON "Sales"(payment_status)
    WHERE is_voided = false;

CREATE INDEX IF NOT EXISTS idx_sales_customer_phone
    ON "Sales"(customer_phone)
    WHERE is_voided = false;

CREATE INDEX IF NOT EXISTS idx_sales_receipt_number
    ON "Sales"(receipt_number)
    WHERE receipt_number IS NOT NULL;

-- Inventory search by name (used in every sale lookup)
CREATE INDEX IF NOT EXISTS idx_inventory_item_name
    ON "Inventory"(item_name);

-- Expenses date range scans
CREATE INDEX IF NOT EXISTS idx_expenses_date
    ON expenses(expense_date DESC);

-- Audit log queries (supplier/PO activity tabs)
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp
    ON audit_logs(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
    ON audit_logs(action);

-- Debt payments lookup by sale
CREATE INDEX IF NOT EXISTS idx_debt_payments_sale_id
    ON debt_payments(sale_id);

-- Payments lookup by sale
CREATE INDEX IF NOT EXISTS idx_payments_sale_id
    ON payments(sale_id);

-- ────────────────────────────────────────────────────────────
-- 4. ROW-LEVEL SECURITY REMINDER (informational)
--    RLS is managed via Supabase dashboard or policies.sql.
--    This migration does not alter RLS — see policies.sql.
-- ────────────────────────────────────────────────────────────

-- Done.
SELECT 'migration_001 applied successfully' AS status;
