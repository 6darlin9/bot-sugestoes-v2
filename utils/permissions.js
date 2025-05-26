// ===== utils/permissions.js =====
const config = require('../config');

function hasStaffPermission(member, config) {
  // Verificar se tem o cargo staff específico
  if (config.roles.staff && member.roles.cache.has(config.roles.staff)) {
    return true;
  }
  
  // Verificar se está na lista de aprovadores
  if (config.aprovadores.includes(member.user.id)) {
    return true;
  }
  
  // Verificar se é administrador
  if (member.permissions.has('Administrator')) {
    return true;
  }
  
  return false;
}

module.exports = { hasStaffPermission };