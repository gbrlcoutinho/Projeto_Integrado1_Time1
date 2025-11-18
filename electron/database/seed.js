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

    const employeeId = employeeService.create({
      name: "Valdomir Ferreira Santiago",
      function: "Operador da ETA",
      cellphone: "(88) 98864-2252",
      availabilities: ["ETA"],
      restrictions: []
    });

    const scaleId = v4();
    const mesTeste = "2023-11";

    const stmtScale = db.prepare(`
      INSERT INTO scales (id, month, type, status) 
      VALUES (?, ?, ?, ?)
    `);

    stmtScale.run(scaleId, mesTeste, "ETA", "RASCUNHO");

    const stmtShift = db.prepare(`
      INSERT INTO scale_shifts (id, scale_id, employee_id, date) 
      VALUES (?, ?, ?, ?)
    `);

    const dias = ["01", "05", "10"];
    dias.forEach(dia => {
      stmtShift.run(v4(), scaleId, employeeId, `${mesTeste}-${dia}`);
    });

    console.log(`Escala de teste criada para ${mesTeste} com 3 plantões.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`Error on seeding database: ${message}`);
  }
}