export const ROLES = {
  USER: "user",
  ADMIN: "admin",
};

export const ROLE_VALUES = Object.values(ROLES);

export const isAdminRole = (role) => role === ROLES.ADMIN;