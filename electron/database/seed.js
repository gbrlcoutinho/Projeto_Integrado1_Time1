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

    employeeService.create({
      name: "Valdomir Ferreira Santiago",
      function: "Operador da ETA",
      cellphone: "(88) 98864-2252",
      availabilities: ["ETA", "PLANTAO_TARDE"],
      restrictions: ["WEEKENDS", "HOLYDAYS"]
    });
    employeeService.create({
      name: "Antônio Fagundes Ferreira",
      function: "Encanador",
      cellphone: "(88) 97634-1821",
      availabilities: ["ETA"],
      restrictions: ["HOLYDAYS"]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`Error on seeding database: ${message}`);
  }
}