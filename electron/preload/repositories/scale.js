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

}