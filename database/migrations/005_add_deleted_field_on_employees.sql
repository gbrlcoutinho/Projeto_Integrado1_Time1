BEGIN;

ALTER TABLE employees
ADD COLUMN deleted INTEGER NOT NULL DEFAULT 1;
-- Use integer as boolean

COMMIT;
