BEGIN;

CREATE TABLE employee_availabilities (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('ETA', 'PLANTAO_TARDE')) NOT NULL,

    FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

COMMIT;