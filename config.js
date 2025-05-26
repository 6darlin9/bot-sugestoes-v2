// ===== config.js =====
module.exports = {
  channels: {
    sugestoes: process.env.SUGESTOES_CHANNEL_ID,
    aprovados: process.env.APROVADOS_CHANNEL_ID,
    regras: '640750650128334859'
  },
  roles: {
    staff: process.env.STAFF_ROLE_ID || 'ID_CARGO_STAFF'
  },
  aprovadores: process.env.APROVADORES_IDS?.split(',') || [],
  maxFileSize: 8 * 1024 * 1024 // 8MB em bytes
};

// ===== config.js =====
module.exports = {
  channels: {
    sugestoes: process.env.SUGESTOES_CHANNEL_ID,
    aprovados: process.env.APROVADOS_CHANNEL_ID,
    regras: '640750650128334859'
  },
  roles: {
    staff: process.env.STAFF_ROLE_ID || 'ID_CARGO_STAFF'
  },
  aprovadores: process.env.APROVADORES_IDS?.split(',') || [],
  maxFileSize: 8 * 1024 * 1024 // 8MB em bytes
};