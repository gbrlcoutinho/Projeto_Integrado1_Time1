/**
 * Busca a escala completa (com turnos) do backend.
 * @param {Object} params - { month: 'YYYY-MM', type: 'ETA' | 'PLANTAO_TARDE' }
 */
export const getScale = async (params) => {
  // Error throw should be handled on frontend function call.
  return await window.ipcRenderer.invoke('get-scale', params);
};

/**
 * Cria uma nova escala com os funcionários e feriados selecionados.
 * @param {Object} params - { month, year, employeeIds: { ETA: [], PLANTAO_TARDE: [] }, holidays: [] }
 */
export const createScale = async (params) => {
  return await window.ipcRenderer.invoke('create-scale', params);
};