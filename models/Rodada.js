const mongoose = require('mongoose');
const cartola = require('../utils/cartola');
const Chicano = require('./Chicano');

const RodadaSchema = new mongoose.Schema({
    rodadaAtual: { type: Number },
    statusMercado: { type: Number },
    temporada: { type: Number },
    fechamento: {
        dia: { type: Number},
        mes: { type: Number},
        ano: { type: Number},
        hora: { type: Number},
        minuto: { type: Number},
        timestamp: { type: Number}
    },
    rodadas:[{
        rodada_id: {
            type: Number
        },
        inicio: {
            type: Date
        },
        fim: {
            type: Date
        }
    }],
    cartolaPartidas: {
        type: Object
    }
});


/*
StatusSchema.pre('save', async function(next){

    const retornoCartola = await cartola(process.env.CARTOLA_MERCADO_STATUS);

    
    const status = await Status.find({ rodadaAtual: this.rodadaAtual});
    if (status) {
        if ( Math.trunc(Date.now()/1000) >= status.fechamento.timestamp){
            const statusDesatualizado = await Status.findByIdAndDelete(status._id); //Chicano.findByIdAndDelete(req.params.id);
        }
    } else {
        const retornoCartola = await cartola(process.env.CARTOLA_MERCADO_STATUS);
        this.rodadaAtual = retornoCartola.rodada_atual;
        this.statusMercado = retornoCartola.status_mercado;
        this.temporada = retorno.temporada;
        this.fechamento = retorno.fechamento;
    }
    

    next();
});
*/

module.exports = mongoose.model('Rodada',RodadaSchema);