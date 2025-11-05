import { ipcMain } from "electron";
import { getEmployeesPaginated } from "../database/employeeRepository";
import { EmployeeService } from "../preload/services/employee";
import { db } from "../database/setup";
import { AuthService } from "../preload/services/auth";

// auth
const auth = new AuthService();

ipcMain.handle('auth-login', async (_event, email, password) => {
  try {
    const token = auth.login(email, password) // lança se inválido
    return { ok: true, token }
  } catch (err) {
    return { ok: false, error: err?.message ?? String(err) }
  }
})

// employee
const employeeService = new EmployeeService(db);

ipcMain.handle('get-all-employees', async (_, { page, limit, searchTerm }) => {
  return getEmployeesPaginated(page, limit, searchTerm);
});

ipcMain.handle('create-employee', async (_, payload) => {
  employeeService.create(payload);
});