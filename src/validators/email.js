// Validador de email (código de ejemplo para la prueba)
// Local part: cualquier cosa sin espacios ni "@".
// Dominio: uno o más labels alfanuméricos (guiones solo en el medio)
// separados por punto, terminando en un TLD de 2+ letras.
const EMAIL_REGEX =
  /^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

function validateEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email);
}

module.exports = { validateEmail };
