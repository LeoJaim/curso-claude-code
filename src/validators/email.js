// Validador de email (código de ejemplo para la prueba)
// BUG: la regex solo exige "algo@algo.algo", por eso acepta "usuario@.com"
const EMAIL_REGEX = /^\S+@\S*\.\S+$/;

function validateEmail(email) {
  return EMAIL_REGEX.test(email);
}

module.exports = { validateEmail };
