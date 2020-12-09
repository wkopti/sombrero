const pontuacao = require('../controllers/pontuacao');

exports.job = {
    key: 'atualizarPontuacao',
    options: {
        repeat: {
            cron: '*/1 * * * *',
        }
    },
    async handle() {
        await pontuacao.carregarPontuacaoCartola();
    },
  };