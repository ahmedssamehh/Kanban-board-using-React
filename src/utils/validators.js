// Validation utility functions

// Validate card title
export const validateCardTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Title is required' };
  }
  if (title.trim().length === 0) {
    return { valid: false, error: 'Title cannot be empty' };
  }
  if (title.length > 200) {
    return { valid: false, error: 'Title must be less than 200 characters' };
  }
  return { valid: true };
};

// Validate list title
export const validateListTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'List title is required' };
  }
  if (title.trim().length === 0) {
    return { valid: false, error: 'List title cannot be empty' };
  }
  if (title.length > 100) {
    return { valid: false, error: 'List title must be less than 100 characters' };
  }
  return { valid: true };
};

// Validate tag
export const validateTag = (tag) => {
  if (!tag || typeof tag !== 'string') {
    return { valid: false, error: 'Tag is required' };
  }
  if (tag.trim().length === 0) {
    return { valid: false, error: 'Tag cannot be empty' };
  }
  if (tag.length > 50) {
    return { valid: false, error: 'Tag must be less than 50 characters' };
  }
  return { valid: true };
};
