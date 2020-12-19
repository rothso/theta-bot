import { Collection, Role } from 'discord.js';

export const getClassRoles = (roles: Collection<string, Role>): Role[] => {
  const allRoles = Array.from(roles.sort((a, b) => a.position - b.position).values());
  const start = allRoles.findIndex((role) => role.name === 'Linear Algebra');
  const end = allRoles.findIndex((role) => role.name === 'Compilers');
  return allRoles.slice(start, end + 1);
};
