export const campoVacio = (valor) => !valor || valor.toString().trim() === '';

export const correoValido = (correo) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

export const esNumeroPositivo = (valor) => {
  const num = Number(valor);
  return !isNaN(num) && num > 0;
};

export const esEnteroPositivo = (valor) => {
  const num = Number(valor);
  return Number.isInteger(num) && num > 0;
};