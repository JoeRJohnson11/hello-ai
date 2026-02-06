const { Config } = require('jest');
const nextJest = require('next/jest.js').default ?? require('next/jest.js');

const createJestConfig = nextJest({
  dir: './',
});

const config: typeof Config = {
  displayName: '@hello-ai/hello-ai',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/hello-ai',
  testEnvironment: 'jsdom',
};

module.exports = createJestConfig(config);
