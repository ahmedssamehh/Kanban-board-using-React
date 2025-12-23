export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    testMatch: ['<rootDir>/src/**/*.test.{js,jsx}', '<rootDir>/src/**/*.spec.{js,jsx}'],
    testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/main.jsx',
        '!src/**/*.test.{js,jsx}',
        '!src/**/*.spec.{js,jsx}',
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
};