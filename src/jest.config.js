/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/../tests"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/../tests/helpers/jest-setup.ts"],
  maxWorkers: 1,
  transformIgnorePatterns: ["/node_modules/(?!jose/)"],
};

module.exports = config;
