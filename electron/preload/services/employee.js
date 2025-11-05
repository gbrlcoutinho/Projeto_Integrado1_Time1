import z, { ZodError } from "zod";
import { SqliteError } from "better-sqlite3";
import { EmployeeRepository } from "../repositories/employee.js";

export class EmployeeService {
  constructor(db) {
    this.repository = new EmployeeRepository(db);
  }

  create(payload) {
    try {
      const parseResult = createEmployeeSchema.parse(payload);
      return this.repository.create(parseResult);
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

  update(payload) {
    try {
      const parseResult = updateEmployeeSchema.parse(payload);
      this.repository.update(parseResult);
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
}

const createEmployeeSchema = z.object({
  name: z.string("Nome é obrigatório.").min(4, "Mínimo de 4 caracteres"),
  function: z.string("Função é obrigatória."),
  cellphone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Formato inválido."),
  availabilities: z
    .array(z.enum(["ETA", "PLANTAO_TARDE"]))
    .min(1, "Funcionário deve ter pelo menos uma disponibilidade.")
    .refine(arr => new Set(arr).size === arr.length, {
      message: "Não são permitidos valores repetidos",
    }),
  restrictions: z
    .array(z.enum(["WEEKENDS", "HOLYDAYS"]))
    .refine(arr => new Set(arr).size === arr.length, {
      message: "Não são permitidos valores repetidos",
    }),
}).strict();

const updateEmployeeSchema = createEmployeeSchema.extend({
  id: z.uuid("Identificador inválido.")
});