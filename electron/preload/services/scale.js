import z, { ZodError } from "zod";
import { ScaleRepository } from "../repositories/scale.js";

export class ScaleService {
  constructor(db) {
    this.repository = new ScaleRepository(db);
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
}

const getScaleSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, "Formato de mês inválido (use YYYY-MM)"),
  type: z.enum(['ETA', 'PLANTAO_TARDE'], "Tipo de escala inválido")
});