module.exports.filterClassRoles = (roles) => {
  // Extract only the class roles
  const allRoles = Array.from(roles.sort((a, b) => a.position - b.position).values());
  const start = allRoles.findIndex((role) => role.name === 'Linear Algebra');
  const end = allRoles.findIndex((role) => role.name === 'Compilers');
  const classRoles = allRoles.slice(start, end + 1);

  return classRoles;
};
