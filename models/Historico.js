const mongoose = require('mongoose');
const cartola = require('../utils/cartola');
const Chicano = require('../models/Chicano');

const HistoricoSchema = new mongoose.Schema({
    idChicano:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chicano',
        required: [true, 'Informe o id do Chicano']
    },
    rodada:{
        type: Number,
        required: [true, 'Informe a rodada do historico']
    },
    jogadores:{
        type: Object
    },
    patrimonio:{
        type: Number
    },
    pontos:{
        type: Number
    },
    pontosCampeonato:{
        type: Number
    }
}).index({ "idChicano" : 1, "rodada" : 1},{ "unique": true} );

// Buscar dados no Cartola
HistoricoSchema.pre('save', async function(next){
    const chicano = await Chicano.findById(this.idChicano);
    const retornoCartola = await cartola(process.env.CARTOLA_TIME+'/'+chicano.idTime+'/'+this.rodada);
    this.jogadores = retornoCartola.atletas;
    this.patrimonio = retornoCartola.patrimonio;
    this.pontos = retornoCartola.pontos;
    this.pontosCampeonato = retornoCartola.pontos_campeonato;
    next();
});

module.exports = mongoose.model('Historico',HistoricoSchema);