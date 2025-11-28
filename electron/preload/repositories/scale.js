export class ScaleRepository {
  constructor(db) {
    this.db = db;
  }

  findByMonthAndType(month, type) {
    try {
      const scale = this.db.prepare(`
        SELECT id, month, type, status 
        FROM scales 
        WHERE month = ? AND type = ?
      `).get(month, type);

      if (!scale) {
        return null;
      }

      const shifts = this.db.prepare(`
        SELECT 
          s.id, 
          s.date, 
          s.employee_id,
          e.name as employee_name,
          e.function as employee_function
        FROM scale_shifts s
        JOIN employees e ON s.employee_id = e.id
        WHERE s.scale_id = ?
        ORDER BY s.date ASC
      `).all(scale.id);

      return {
        ...scale,
        shifts: shifts
      };

    } catch (error) {
      console.error("Erro no repositório de escalas:", error);
      throw new Error("Falha ao buscar escala no banco de dados.");
    }
  }

  create(scale) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scales (id, month, type, status)
        VALUES (?, ?, ?, ?)
      `);

      return stmt.run(scale.id, scale.month, scale.type, scale.status);
    } catch (error) {
      console.error("Erro ao criar escala:", error);
      throw new Error("Falha ao criar escala no banco de dados.");
    }
  }

  createShift(shift) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_shifts (id, scale_id, employee_id, date)
        VALUES (?, ?, ?, ?)
      `);

      return stmt.run(shift.id, shift.scale_id, shift.employee_id, shift.date);
    } catch (error) {
      console.error("Erro ao criar turno:", error);
      throw new Error("Falha ao criar turno no banco de dados.");
    }
  }

  createMultipleShifts(shifts) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_shifts (id, scale_id, employee_id, date)
        VALUES (?, ?, ?, ?)
      `);

      const transaction = this.db.transaction((shifts) => {
        for (const shift of shifts) {
          stmt.run(shift.id, shift.scale_id, shift.employee_id, shift.date);
        }
      });

      return transaction(shifts);
    } catch (error) {
      console.error("Erro ao criar múltiplos turnos:", error);
      throw new Error("Falha ao criar turnos no banco de dados.");
    }
  }

  addShift(scaleID, employeeId, date) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO scale_shifts(id, scale_id, employee_id, date)
        VALUES (?, ?, ?, ?)
      `);
      
      const shiftId = randomUUID();
      const result = stmt.run(shiftId, scaleID, employeeId, date);

      return shiftId;
    } catch (error) {
      console.error('Erro ao adicionar turno:', error);
      throw new Error(`Falha ao adicionar turno no banco de dados: ${error.message}`);
    }
  }

  removeShift(scaleID, employeeId, date) {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM scale_shifts
        WHERE scale_id = ? AND employee_id = ? AND date = ?
      `);

      const result = stmt.run(scaleID, employeeId, date);

      if (result.changes === 0) {
        throw new Error("Turno não encontrado");
      }

      return result;
    } catch (error) {
      console.error('Erro ao remover turno:', error);
      throw new Error(`Falha ao remover turno no banco de dados: ${error.message}`);
    }
  }
}