// jest.config.ts
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {

    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage', // Coverage files output directory
    rootDir: '.',
    testMatch: ['<rootDir>/src/__tests__/**/*.test.ts' ], // Test regex
    
    modulePathIgnorePatterns: ['<rootDir>/dist/'], // Modules to ignore when running tests
    setupFilesAfterEnv: [ '<rootDir>/src/__tests__/setup.ts'], // Setup files to run before tests
    
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

    // Path aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};

export default config;