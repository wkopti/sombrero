const verificarBase = require('../utils/verificarBase');

exports.job = {
    key: 'verificarBase',
    options: {
        repeat: {cron: '*/1 * * * *'}
    },
    async handle() {
        await verificarBase.rodadaAtual();
    },
  };