import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

const nextConfig = nx.configs['flat/next'];
const nextArray = Array.isArray(nextConfig)
  ? nextConfig
  : nextConfig
    ? [nextConfig]
    : [];

export default [
  // Workspace-wide rules (formatting, import ordering, etc.)
  ...baseConfig,

  // Nx-maintained flat config for Next.js + React + TypeScript
  ...nextArray,

  {
    ignores: ['.next/**/*', 'out/**/*'],
  },
];
