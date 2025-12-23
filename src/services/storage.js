// Storage service for localStorage persistence
const STORAGE_KEY = 'kanban_board_data';

// Save board state to localStorage
export const saveBoard = (boardState) => {
  try {
    const serialized = JSON.stringify(boardState);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Load board state from localStorage
export const loadBoard = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized);
  } catch (error) {
    return null;
  }
};

// Clear board data from localStorage
export const clearBoard = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

// Check if localStorage is available
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};
