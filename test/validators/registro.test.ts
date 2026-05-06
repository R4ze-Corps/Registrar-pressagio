import { expect, test } from 'vitest';
import { validateNome, validateTelefone } from "../../src/validators/registro";

test('validateNome single word accepted', () => {
  expect(validateNome('Maria')).toBe(true);
  expect(validateNome('João')).toBe(true);
});

test('validateNome rejects multiple words', () => {
  expect(validateNome('Maria Silva')).toBe(false);
  expect(validateNome('Joao da Silva')).toBe(false);
});

test('validateNome rejects empty', () => {
  expect(validateNome('')).toBe(false);
  expect(validateNome(' ')).toBe(false);
});

test('validateTelefone keeps existing formats', () => {
  expect(validateTelefone('0')).toBe(true);
  expect(validateTelefone('00')).toBe(true);
  expect(validateTelefone('000')).toBe(true);
  expect(validateTelefone('000-000')).toBe(true);
  expect(validateTelefone('000000')).toBe(true);
});

test('validateTelefone rejects invalid formats', () => {
  expect(validateTelefone('123-45')).toBe(false);
  expect(validateTelefone('abcd')).toBe(false);
  expect(validateTelefone('1234')).toBe(false);
});
