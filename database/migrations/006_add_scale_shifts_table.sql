BEGIN;

CREATE TABLE IF NOT EXISTS scale_shifts (
    id TEXT PRIMARY KEY,
    scale_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    date TEXT NOT NULL,
    
    FOREIGN KEY (scale_id) REFERENCES scales(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

COMMIT;