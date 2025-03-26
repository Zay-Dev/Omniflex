const SUSPICIOUS_PATHS = [
  '/.env',
  '/wp-admin',
  '/admin',
  '/phpinfo',
  '/config',
  '/backup',
  '/.git',
  '/api/graphql',
];

const HEALTH_CHECK_PATHS = [
  '/health/',
  '/ping/',
  '/status/',
];

export const SENSITIVE_KEYS = [
  // Authentication related
  'password',
  'token',
  'apiKey',
  'secret',
  'authorization',
  'auth',
  // Personal information
  'ssn',
  'socialSecurity',
  'dob',
  'birthDate',
  'creditCard',
  'cardNumber',
  'cvv',
  'pin',
  // Contact information that could be sensitive
  'email',
  'phone',
  'address',
  // Generic sensitive terms
  'private',
  'secure',
  'confidential',
];

export const PATHS = {
  SUSPICIOUS_PATHS,
  HEALTH_CHECK_PATHS,
};