module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '!**/tests/**/*.e2e.test.ts'],
  transform: {
    '\\.test\\.ts$': [
      'ts-jest',
      {
        diagnostics: false,
      },
    ],
  },
}
