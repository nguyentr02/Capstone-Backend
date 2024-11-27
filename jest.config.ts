// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    // Specifies that we're using ts-jest to handle TypeScript files
    preset: 'ts-jest',
    testEnvironment: 'node',
    
    // Directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    rootDir: '.',
    
    testMatch: ['<rootDir>/src/__tests__/**/*.test.ts' ],
    // Modules to ignore when running tests
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    // Setup files to run before tests
    setupFilesAfterEnv: [ '<rootDir>/src/__tests__/setup.ts'],
    
    moduleFileExtensions: [
        'ts',
        'js',
        'json',
        'node'
    ],
    
    // Coverage collection settings
    collectCoverageFrom: [
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/src/**/*.interface.ts',
        '!<rootDir>/src/types/**/*.ts'
    ],
    
    // Configure path aliases (if you're using them in tsconfig)
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};

export default config;