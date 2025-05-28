export const ADMIN_EMAIL = "admin@eventmanagement.com";
export const ADMIN_PASSWORD = "Admin@123";

// This is just a helper function to check if a user is admin
export const isAdminEmail = (email) => {
  return email === ADMIN_EMAIL;
}; 