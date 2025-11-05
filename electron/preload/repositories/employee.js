export class EmployeeRepository {
  constructor(db) {
    this.db = db;
  }

  create(payload) {
    this.db.transaction(() => {
      const userInsert = this.db.prepare("INSERT INTO employees (id, name, function, cellphone) VALUES (@id, @name, @function, @cellphone)");

      const insertAvailability = this.db.prepare(
        "INSERT INTO employee_availabilities (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      const insertRestriction = this.db.prepare(
        "INSERT INTO employee_restrictions (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      const employeeId = crypto.randomUUID();

      userInsert.run({
        id: employeeId,
        name: payload.name,
        function: payload.function,
        cellphone: payload.cellphone,
      });

      for (const availability of payload.availabilities) {
        insertAvailability.run({
          id: crypto.randomUUID(),
          employeeId,
          type: availability
        });
      }

      for (const restriction of payload.restrictions) {
        insertRestriction.run({
          id: crypto.randomUUID(),
          employeeId,
          type: restriction
        });
      }
    })()
  }
}