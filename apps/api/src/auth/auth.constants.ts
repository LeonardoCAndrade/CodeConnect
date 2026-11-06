const DEVELOPMENT_SECRET = 'codeconnect-dev-secret-nao-use-em-producao';
const DEFAULT_EXPIRES_IN_SECONDS = 3600;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET deve ser definido em produção');
  }
  return DEVELOPMENT_SECRET;
}

export function getJwtExpiresInSeconds(): number {
  const value = Number(process.env.JWT_EXPIRES_IN);
  return Number.isInteger(value) && value > 0
    ? value
    : DEFAULT_EXPIRES_IN_SECONDS;
}
