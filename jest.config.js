module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  clearMocks: true,
  restoreMocks: true,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.spec.json" }],
  },
  moduleNameMapper: {
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^application/(.*)$": "<rootDir>/src/application/$1",
  },
};
