const mongoose = require('mongoose');

const HistoricoSchema = new mongoose.Schema({
    idChicano:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chicano'
    },
    rodada:{
        type: Number,
        required: [true, 'Informe a rodada do historico']
    },
    patrimonio:{
        type: Number,
        required: [true, 'Informe o patrimonio do historico']
    },
    pontos:{
        type: Number,
        required: [true, 'Informe os pontos do historico']
    },
    pontosCampeonato:{
        type: Number,
        required: [true, 'Informe os pontos acumulados do historico']
    }
});

module.exports = mongoose.model('Historico',HistoricoSchema);