BEGIN;

CREATE TABLE employee_restrictions (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    type TEXT CHECK (type IN ('WEEKENDS', 'HOLYDAYS')) NOT NULL,

    FOREIGN KEY (employee_id) REFERENCES employees(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

COMMIT;