export class EmployeeRepository {
  constructor(db) {
    this.db = db;
  }

  create(payload) {
    return this.db.transaction(() => {
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

      return employeeId;
    })()
  }

  update(payload) {
    this.db.transaction(() => {
      const userUpdate = this.db.prepare("UPDATE employees SET name=@name, function=@function, cellphone=@cellphone WHERE id=@id");

      const employeeId = payload.id;

      userUpdate.run({
        id: employeeId,
        name: payload.name,
        function: payload.function,
        cellphone: payload.cellphone,
      });

      this.db
        .prepare("DELETE FROM employee_availabilities WHERE employee_id=@employeeId")
        .run({ employeeId });

      const insertAvailability = this.db.prepare(
        "INSERT INTO employee_availabilities (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

      for (const availability of payload.availabilities) {
        insertAvailability.run({
          id: crypto.randomUUID(),
          employeeId,
          type: availability
        });
      }

      this.db
        .prepare("DELETE FROM employee_restrictions WHERE employee_id=@employeeId")
        .run({ employeeId });

      const insertRestriction = this.db.prepare(
        "INSERT INTO employee_restrictions (id, employee_id, type) VALUES (@id, @employeeId, @type)"
      );

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