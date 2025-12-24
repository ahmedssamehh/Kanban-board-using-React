// Manual mock for uuid module to fix Jest ESM import issues
let counter = 0;

export const v4 = () => {
    counter++;
    return `test-uuid-${counter}`;
};

// Reset counter for test isolation
export const __resetCounter = () => {
    counter = 0;
};