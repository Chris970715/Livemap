/**
 * Error message constants
 * Centralized messages for consistent error responses
 */

export const ERROR_MESSAGES = {
  // Authentication / authorization
  UNAUTHORIZED: "Please log in to continue.",
  ACCESS_DENIED: "You don't have permission to access this.",
  NOT_OWNER: "Only the owner of this resource can access it.",
  EMAIL_PASSWORD_REQUIRED: "Please enter your email and password.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  SIGNIN_ERROR: "Something went wrong while signing in.",
  ALL_FIELDS_REQUIRED: "Please fill in all fields.",
  PASSWORD_MISMATCH: "Passwords do not match.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  EMAIL_ALREADY_EXISTS: "This email is already in use.",
  SIGNUP_LOGIN_FAILED: "Your account was created, but signing in failed.",

  // Resources (generic)
  NOT_FOUND: (resource: string) => `${resource} not found.`,

  // Resources (items)
  ITEM_NOT_FOUND: "Item not found.",

  // Input validation
  INVALID_INPUT: "Invalid input.",
  REQUIRED_FIELD: (field: string) => `${field} is required.`,
  TITLE_REQUIRED: "Please enter a title.",

  // Permissions
  ITEM_OWNER_ONLY: "Only the owner of this item can do this.",

  // Server errors
  SERVER_ERROR: "A server error occurred.",
  REQUEST_ERROR: "Something went wrong while processing your request.",
} as const;

export const SUCCESS_MESSAGES = {
  // Create
  CREATED: (resource: string) => `${resource} created.`,

  // Update
  UPDATED: (resource: string) => `${resource} updated.`,

  // Delete
  DELETED: (resource: string) => `${resource} deleted.`,
} as const;
