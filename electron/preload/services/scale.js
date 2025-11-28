import z, { uuid, ZodError } from "zod";
import { ScaleRepository } from "../repositories/scale.js";
import { EmployeeRepository } from "../repositories/employee.js";
import { randomUUID } from "crypto";

export class ScaleService {
  constructor(db) {
    this.repository = new ScaleRepository(db);
    this.employeeRepository = new EmployeeRepository(db);
  }

  getScale(params) {
    try {
      const { month, type } = getScaleSchema.parse(params);

      const scale = this.repository.findByMonthAndType(month, type);

      return scale;

    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      if (err instanceof SqliteError) {
        throw new Error(`Erro no banco de dados: ${err.message}`);
      }
      throw new Error(`Erro inesperado: ${err.message}`);
    }
  }

  async createScale(params) {
    try {
      const { month, year, employeeIds, holidays } = createScaleSchema.parse(params);

      // Format month string
      const monthString = `${year}-${String(month).padStart(2, '0')}`;

      // Collect all employee IDs from both scales
      const allEmployeeIds = [
        ...employeeIds.ETA.map(emp => emp.id),
        ...employeeIds.PLANTAO_TARDE.map(emp => emp.id)
      ];

      // Get employee details with restrictions from database
      const employeesWithRestrictions = this.employeeRepository.findByIds(allEmployeeIds);

      // Create mapping for easy lookup
      const employeeMap = new Map();
      employeesWithRestrictions.forEach(emp => {
        employeeMap.set(emp.id, {
          ...emp,
          restrictions: emp.restrictions ? emp.restrictions.split(',') : [],
          availabilities: emp.availabilities ? emp.availabilities.split(',') : []
        });
      });

      // Prepare data for algorithm
      const scaleData = {
        month: monthString,
        year,
        holidays,
        employees: {
          ETA: employeeIds.ETA.map(emp => ({
            ...emp,
            ...employeeMap.get(emp.id)
          })),
          PLANTAO_TARDE: employeeIds.PLANTAO_TARDE.map(emp => ({
            ...emp,
            ...employeeMap.get(emp.id)
          }))
        }
      };

      console.log('Scale creation data collected:', {
        monthString,
        employeesCount: {
          ETA: scaleData.employees.ETA.length,
          PLANTAO_TARDE: scaleData.employees.PLANTAO_TARDE.length
        },
        holidaysCount: holidays.length,
        employeesWithRestrictions: employeesWithRestrictions.length
      });

      // Generate shifts using the algorithm
      const generatedShifts = this.generateShifts(scaleData);

      // For testing: Return generated shifts without saving to database
      console.log('Generated shifts for testing:', {
        month: generatedShifts.month,
        totalWorkingDays: generatedShifts.workingDays.length,
        etaShifts: generatedShifts.shifts.ETA.length,
        plantaoShifts: generatedShifts.shifts.PLANTAO_TARDE.length
      });

      // Format shifts for frontend consumption (matching existing structure)
      const formattedShifts = {
        ETA: {
          id: 'test-eta-scale',
          month: generatedShifts.month,
          type: 'ETA',
          status: 'RASCUNHO',
          shifts: generatedShifts.shifts.ETA.map(shift => ({
            id: `test-shift-${shift.date}-${shift.employeeId}`,
            date: shift.date,
            employee_id: shift.employeeId,
            employee_name: shift.employeeName,
            employee_function: 'Operador da ETA'
          }))
        },
        PLANTAO_TARDE: {
          id: 'test-plantao-scale',
          month: generatedShifts.month,
          type: 'PLANTAO_TARDE',
          status: 'RASCUNHO',
          shifts: generatedShifts.shifts.PLANTAO_TARDE.map(shift => ({
            id: `test-shift-${shift.date}-${shift.employeeId}`,
            date: shift.date,
            employee_id: shift.employeeId,
            employee_name: shift.employeeName,
            employee_function: 'Encanador'
          }))
        }
      };

      return {
        success: true,
        message: 'Escalas geradas com sucesso (modo teste)',
        data: formattedShifts,
        testing: true,
        stats: {
          workingDays: generatedShifts.workingDays.length,
          etaShifts: generatedShifts.shifts.ETA.length,
          plantaoShifts: generatedShifts.shifts.PLANTAO_TARDE.length,
          totalShifts: generatedShifts.shifts.ETA.length + generatedShifts.shifts.PLANTAO_TARDE.length
        }
      };

    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      if (err instanceof SqliteError) {
        throw new Error(`Erro no banco de dados: ${err.message}`);
      }
      throw new Error(`Erro inesperado: ${err.message}`);
    }
  }

  generateShifts(scaleData) {
    const { month, year, holidays, employees } = scaleData;

    // Get all working days (excluding weekends and holidays)
    const workingDays = this.getWorkingDays(year, parseInt(month.split('-')[1]), holidays);

    // Initialize employee state tracking
    const employeeState = {
      ETA: new Map(),
      PLANTAO_TARDE: new Map()
    };

    // Initialize employee counters and states
    employees.ETA.forEach(emp => {
      employeeState.ETA.set(emp.id, {
        employee: emp,
        lastWorkedDate: null,
        daysSinceLastWork: 4, // Start with 4 so they can work on first day
        shiftsWorked: 0
      });
    });

    employees.PLANTAO_TARDE.forEach(emp => {
      employeeState.PLANTAO_TARDE.set(emp.id, {
        employee: emp,
        lastWorkedDate: null,
        daysSinceLastWork: 0,
        shiftsWorked: 0
      });
    });

    const shifts = {
      ETA: [],
      PLANTAO_TARDE: []
    };

    // Generate shifts for each working day
    workingDays.forEach(dayInfo => {
      const { date: dateStr, dayOfWeek, isHoliday } = dayInfo;

      // Assign ETA shift
      const etaEmployee = this.assignETAShift(dateStr, dayOfWeek, isHoliday, employeeState.ETA);
      if (etaEmployee) {
        shifts.ETA.push({
          date: dateStr,
          employeeId: etaEmployee.id,
          employeeName: etaEmployee.name
        });

        // Update employee state
        const empState = employeeState.ETA.get(etaEmployee.id);
        empState.lastWorkedDate = dateStr;
        empState.daysSinceLastWork = 0;
        empState.shiftsWorked++;
      }

      // Assign PLANTAO_TARDE shift (exclude employee who worked ETA today)
      const plantaoEmployee = this.assignPlantaoShift(dateStr, dayOfWeek, isHoliday, employeeState.PLANTAO_TARDE, etaEmployee?.id);
      if (plantaoEmployee) {
        shifts.PLANTAO_TARDE.push({
          date: dateStr,
          employeeId: plantaoEmployee.id,
          employeeName: plantaoEmployee.name
        });

        // Update employee state
        const empState = employeeState.PLANTAO_TARDE.get(plantaoEmployee.id);
        empState.lastWorkedDate = dateStr;
        empState.shiftsWorked++;
      }

      // Update days since last work for all ETA employees
      employeeState.ETA.forEach(empState => {
        if (empState.lastWorkedDate !== dateStr) {
          empState.daysSinceLastWork++;
        }
      });
    });

    return {
      month: scaleData.month,
      year: scaleData.year,
      shifts,
      workingDays
    };
  }

  getWorkingDays(year, month, holidays) {
    const workingDays = [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const holidaySet = new Set(holidays);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Include ALL days - weekends and holidays are only excluded per employee restrictions
      workingDays.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        isHoliday: holidaySet.has(dateStr)
      });
    }

    return workingDays;
  }

  assignETAShift(dateStr, dayOfWeek, isHoliday, etaEmployeeState) {
    // Find eligible ETA employees (must have 3+ days off after last work)
    const eligibleEmployees = [];

    etaEmployeeState.forEach((empState, employeeId) => {
      const employee = empState.employee;

      // Check if employee has completed required days off (3 days minimum)
      if (empState.daysSinceLastWork < 3) {
        return; // Skip this employee
      }

      // Check employee restrictions
      if (this.hasRestrictionForDate(employee, dayOfWeek, isHoliday)) {
        return; // Skip this employee
      }

      eligibleEmployees.push({
        ...employee,
        shiftsWorked: empState.shiftsWorked,
        daysSinceLastWork: empState.daysSinceLastWork
      });
    });

    if (eligibleEmployees.length === 0) {
      return null;
    }

    // Sort by: fewer shifts worked, then by more days since last work
    eligibleEmployees.sort((a, b) => {
      if (a.shiftsWorked !== b.shiftsWorked) {
        return a.shiftsWorked - b.shiftsWorked;
      }
      return b.daysSinceLastWork - a.daysSinceLastWork;
    });

    return eligibleEmployees[0];
  }

  assignPlantaoShift(dateStr, dayOfWeek, isHoliday, plantaoEmployeeState, excludeEmployeeId) {
    // Find eligible PLANTAO_TARDE employees
    const eligibleEmployees = [];

    plantaoEmployeeState.forEach((empState, employeeId) => {
      const employee = empState.employee;

      // Exclude employee who worked ETA today
      if (excludeEmployeeId && employee.id === excludeEmployeeId) {
        return;
      }

      // Check employee restrictions
      if (this.hasRestrictionForDate(employee, dayOfWeek, isHoliday)) {
        return;
      }

      eligibleEmployees.push({
        ...employee,
        shiftsWorked: empState.shiftsWorked
      });
    });

    if (eligibleEmployees.length === 0) {
      return null;
    }

    // Sort by fewer shifts worked for balance
    eligibleEmployees.sort((a, b) => a.shiftsWorked - b.shiftsWorked);

    return eligibleEmployees[0];
  }

  hasRestrictionForDate(employee, dayOfWeek, isHoliday) {
    const restrictions = employee.restrictions || [];

    // Check weekend restriction - only exclude if employee has WEEKENDS restriction
    if (restrictions.includes('WEEKENDS') && (dayOfWeek === 0 || dayOfWeek === 6)) {
      return true;
    }

    // Check holiday restriction - only exclude if employee has HOLYDAYS restriction
    if (restrictions.includes('HOLYDAYS') && isHoliday) {
      return true;
    }

    return false;
  }

  async createScalesInDatabase(generatedShifts, scaleData) {
    const { month, shifts } = generatedShifts;

    try {
      // Create ETA scale
      const etaScaleId = randomUUID();
      await this.repository.create({
        id: etaScaleId,
        month: month,
        type: 'ETA',
        status: 'RASCUNHO'
      });

      // Create PLANTAO_TARDE scale
      const plantaoScaleId = randomUUID();
      await this.repository.create({
        id: plantaoScaleId,
        month: month,
        type: 'PLANTAO_TARDE',
        status: 'RASCUNHO'
      });

      // Create ETA shifts
      const etaShifts = shifts.ETA.map(shift => ({
        id: randomUUID(),
        scale_id: etaScaleId,
        employee_id: shift.employeeId,
        date: shift.date
      }));

      if (etaShifts.length > 0) {
        await this.repository.createMultipleShifts(etaShifts);
      }

      // Create PLANTAO_TARDE shifts
      const plantaoShifts = shifts.PLANTAO_TARDE.map(shift => ({
        id: randomUUID(),
        scale_id: plantaoScaleId,
        employee_id: shift.employeeId,
        date: shift.date
      }));

      if (plantaoShifts.length > 0) {
        await this.repository.createMultipleShifts(plantaoShifts);
      }

      return {
        etaScale: {
          id: etaScaleId,
          shiftsCount: etaShifts.length
        },
        plantaoScale: {
          id: plantaoScaleId,
          shiftsCount: plantaoShifts.length
        },
        totalShifts: etaShifts.length + plantaoShifts.length,
        workingDays: generatedShifts.workingDays.length
      };

    } catch (error) {
      console.error('Error creating scales in database:', error);
      throw new Error(`Falha ao salvar escalas no banco de dados: ${error.message}`);
    }
  }

updateManualShifts(params) {
    try {
      const { scaleId, date, finalEmployeeIds } = updateManualShiftsSchema.parse(params);
      
      const currentlyAllocatedIds = this.repository.getShiftsByDay(scaleId, date);
      
      const finalSet = new Set(finalEmployeeIds);
      const allocatedSet = new Set(currentlyAllocatedIds);

      const idsToRemove = currentlyAllocatedIds.filter(id => !finalSet.has(id));
      const idsToAdd = finalEmployeeIds.filter(id => !allocatedSet.has(id));
      
      this.repository.executeShiftTransaction((repo) => {
        
        idsToRemove.forEach(employeeId => {
          repo.removeShift(scaleId, employeeId, date); 
        });

        idsToAdd.forEach(employeeId => {
          repo.addShift(scaleId, employeeId, date); 
        });
      });
      
      return { success: true, changes: idsToAdd.length + idsToRemove.length };

    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação dos dados: ${err.message}`);
      }
      if (err instanceof SqliteError) {
        throw new Error(`Erro no banco de dados: ${err.message}`);
      }
      throw new Error(`Erro inesperado: ${err.message}`);
    }
  }
  
  getEmployeesForDayModal(params) {
    try {
      const { date, scaleType, scaleId } = getDayModalDataSchema.parse(params);
      
      // 1. Busca todos os funcionários elegíveis para esse tipo de escala
      const eligibleEmployees = this.employeeRepository.findEligible(scaleType); 
      
      // 2. Busca apenas os IDs dos que JÁ estão trabalhando nesse dia e escala
      const allocatedEmployeeIds = this.repository.getShiftsByDay(scaleId, date);
      
      return {
        eligibleEmployees,
        allocatedEmployeeIds,
        date,
        scaleId,
        scaleType
      };
    } catch (err) {
      if (err instanceof ZodError) {
        throw new Error(`Erro de validação: ${err.message}`);
      }
      throw err;
    }
  }
}



const getScaleSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (use YYYY-MM)"),
  type: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido")
});

const createScaleSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  employeeIds: z.object({
    ETA: z.array(z.object({
      id: z.string(),
      name: z.string().optional(),
      availabilities: z.string().optional()
    })),
    PLANTAO_TARDE: z.array(z.object({
      id: z.string(),
      name: z.string().optional(),
      availabilities: z.string().optional()
    }))
  }),
  holidays: z.array(z.string())
});

const getDayModalDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (YYYY-MM-DD)"),
  scaleType: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido"),
  scaleId: z.string("ID da escala inválido")
});

const updateManualShiftsSchema = z.object({
  scaleId: z.string("ID da escala inválido"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de data inválido (use YYYY-MM-DD)"),
  finalEmployeeIds: z.array(z.string("ID de funcionário inválido"))
});