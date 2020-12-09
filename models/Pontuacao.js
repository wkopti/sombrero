const mongoose = require('mongoose');

const PontuacaoSchema = new mongoose.Schema({
    rodada: {
        type: Number
    },
    atletas: {},
    clubes: {},
    posicoes: {},
    total_atletas: {
        type: Number
    },
    criadoEm: {
        type: Date,
        default: Date.now
    },
    atualizadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pontuacao',PontuacaoSchema);