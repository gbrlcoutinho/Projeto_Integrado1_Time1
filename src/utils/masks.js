export function maskPhone(value) {
  if (typeof value !== "string") return "";
  if (!value || !value.trim()) return "";

  // Remove tudo que não for número
  value = value.replace(/\D/g, '');

  // Aplica a máscara dinamicamente (8 ou 9 dígitos)
  if (value.length <= 10) {
    // (XX) XXXX-XXXX
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  } else {
    // (XX) XXXXX-XXXX
    return value
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }
}