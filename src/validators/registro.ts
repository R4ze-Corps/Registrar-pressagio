export function validateNome(nome: string): boolean {
  if (!nome) return false;
  const trimmed = nome.trim();
  // Validação atualizada: apenas um único nome (sem espaços)
  const re = /^[A-Za-zÀ-ÿ]+$/u;
  return re.test(trimmed);
}

export function validateTelefone(telefone: string): boolean {
  if (!telefone) return false;
  const t = telefone.trim();
  const re = /^(?:\d{1,3}|\d{6}|\d{3}-\d{3})$/;
  return re.test(t);
}
