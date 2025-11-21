import { v4 } from "uuid";
import { EmployeeService } from "../preload/services/employee.js";

export const seedDB = (db) => {
  try {
    const stmtUser = db.prepare("INSERT INTO users (id, name, email, password) VALUES (@id, @name, @email, @password);");

    stmtUser.run({
      id: v4(),
      name: "Admin",
      email: "admin@mail.com",
      password: "$2b$10$puBkQd1odfODaeA5nqD.e.khdJercpOiji2/i.CX6D9NQKVlAx9u."
    });

    const employeeService = new EmployeeService(db);

    const employee1Id = employeeService.create({
      name: "Valdomir Ferreira Santiago",
      function: "Operador da ETA",
      cellphone: "(88) 98864-2252",
      availabilities: ["ETA"],
      restrictions: []
    });

    const employee2Id = employeeService.create({
      name: "José da Silva",
      function: "Operador da ETA",
      cellphone: "(85) 99999-1234",
      availabilities: ["ETA"],
      restrictions: []
    });

    const scaleId = v4();
    const mesTeste = "2025-11";

    const stmtScale = db.prepare(`
      INSERT INTO scales (id, month, type, status) 
      VALUES (?, ?, ?, ?)
    `);

    stmtScale.run(scaleId, mesTeste, "ETA", "RASCUNHO");

    const stmtShift = db.prepare(`
      INSERT INTO scale_shifts (id, scale_id, employee_id, date) 
      VALUES (?, ?, ?, ?)
    `);

    stmtShift.run(v4(), scaleId, employee1Id, `${mesTeste}-01`);

    stmtShift.run(v4(), scaleId, employee1Id, `${mesTeste}-05`);
    stmtShift.run(v4(), scaleId, employee2Id, `${mesTeste}-05`);

    stmtShift.run(v4(), scaleId, employee2Id, `${mesTeste}-10`);

    console.log(`Escala de teste criada para ${mesTeste}.`);
    console.log(" - Dia 01: 1 funcionário");
    console.log(" - Dia 05: 2 funcionários");
    console.log(" - Dia 10: 1 funcionário");
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`Error on seeding database: ${message}`);
  }
}