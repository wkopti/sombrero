const mongoose = require('mongoose');

const ConfrontoSchema = new mongoose.Schema({
    jogadores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chicano'
    }],
    rodadaCartola: {
        type: Number,
        required: true
    },
    idCampeonato: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campeonato'
    },
    encerrado: {
        type: Boolean,
        default: false
    },
    vencedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chicano'
    },
    saldo: {
        type: Number
    }
});

module.exports = mongoose.model('Confronto',ConfrontoSchema);