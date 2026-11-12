const test = require('node:test');
const assert = require('node:assert');
const { validateEmail } = require('./email');

test('acepta emails válidos', () => {
  for (const e of [
    'usuario@dominio.com',
    'nombre.apellido@sub.dominio.com.ar',
    'user+tag@dominio.io',
  ]) {
    assert.strictEqual(validateEmail(e), true, e);
  }
});

test('rechaza emails inválidos', () => {
  for (const e of [
    'usuario@.com',
    'usuario@com',
    'usuario@dominio..com',
    '@dominio.com',
    'usuario@dominio.',
    'usuario@-dominio.com',
    'usuario @dominio.com',
    '',
  ]) {
    assert.strictEqual(validateEmail(e), false, e);
  }
});
