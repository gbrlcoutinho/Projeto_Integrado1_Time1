import { ipcMain } from "electron";
import { EmployeeService } from "../preload/services/employee";
import { ScaleService } from "../preload/services/scale";
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

ipcMain.handle('get-all-employees', async (_, params) => {
  return employeeService.getPaginated(params);
});

// Handler para mover shift via drag-drop
ipcMain.handle('move-shift-drag-drop', async (_, params) => {
  try {
    const { scaleId, scaleType, employeeId, oldDate, newDate } = params;

    // Validações
    if (!scaleId || !scaleType || !employeeId || !oldDate || !newDate) {
      return {
        success: false,
        error: 'Parâmetros inválidos'
      };
    }

    // Validar colisão no novo dia
    const hasCollisionOnNewDate = scaleService.checkCollision(
      scaleId,
      employeeId,
      newDate,
      scaleType
    );

    if (hasCollisionOnNewDate) {
      return {
        success: false,
        error: `Funcionário já possui alocação nesta data`
      };
    }

    // Se for ETA, validar regra de 3 dias de folga
    if (scaleType === 'ETA') {
      const violatesRestRule = scaleService.checkETARestRule(
        scaleId,
        employeeId,
        newDate
      );

      if (violatesRestRule) {
        return {
          success: false,
          error: 'Funcionário não pode trabalhar - necessário 3 dias de folga após trabalho anterior'
        };
      }
    }

    // Remover shift da data antiga
    scaleService.repository.removeShift(scaleId, employeeId, oldDate);

    // Adicionar shift na nova data
    scaleService.repository.addShift(scaleId, employeeId, newDate);

    return {
      success: true,
      message: 'Shift movido com sucesso'
    };
  } catch (err) {
    console.error('Erro ao mover shift:', err);
    return {
      success: false,
      error: err?.message ?? String(err)
    };
  }
});

ipcMain.handle('find-eligible-employees', async (_, params) => {
  try {
    return employeeService.findEligible(params);
  } catch (err) {
    return { error: err?.message ?? String(err) }
  }
});

ipcMain.handle('create-employee', async (_, payload) => {
  employeeService.create(payload);
});

ipcMain.handle('update-employee', async (_, payload) => {
  employeeService.update(payload);
});

ipcMain.handle('delete-employee', async (_, id) => {
  employeeService.delete(id);
});

//scale
const scaleService = new ScaleService(db);

ipcMain.handle('get-scale', async (_, params) => {
  try {
    return scaleService.getScale(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('create-scale', async (_, params) => {
  try {
    return await scaleService.createScale(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('get-day-modal-data', async (_, params) => {
  try {
    return scaleService.getEmployeesForDayModal(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});

ipcMain.handle('update-manual-shifts', async (_, params) => {
  try {
    return scaleService.updateManualShifts(params);
  } catch (err) {
    return { error: err?.message ?? String(err) };
  }
});