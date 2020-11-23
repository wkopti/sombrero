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
    }
});

module.exports = mongoose.model('Pontuacao',PontuacaoSchema);