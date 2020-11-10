const mongoose = require('mongoose');
const cartola = require('../utils/cartola');
const Chicano = require('../models/Chicano');

const HistoricoSchema = new mongoose.Schema({
    idChicano:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chicano',
        required: [true, 'Informe o id do Chicano']
    },
    rodada: {
        type: Number,
        required: [true, 'Informe a rodada']
    },
    retornoCartola:{
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
}).index({ idChicano: 1, rodada: 1},{ unique: true});

/*
HistoricoSchema.statics.retornaPontuacao = async function(idChicano, rodadaInicio, rodadaFim){
    console.log('Calculando media de pontos do chicano com base nas rodadas');

    const obj = await this.aggregate([
        {
            $match: { idChicano: idChicano }
        },
        {
            $group: {
                pontuacao: 
            }
        }
    ]);

};
*/

HistoricoSchema.pre('save', async function(next){

    const chicano = await Chicano.findById(this.idChicano);

    const retornoCartola = await cartola(process.env.CARTOLA_TIME+'/'+chicano.idTime+'/'+this.rodada);

    if(retornoCartola){
        this.retornoCartola = retornoCartola;
        this.pontos = retornoCartola.pontos;
        this.pontosCampeonato = retornoCartola.pontos_campeonato;
    }

    next();
});

// Buscar dados no Cartola
/*
HistoricoSchema.post('save', async function(doc, next){

    // Se nao foi informada rodada
    if(!this.rodada){
        let rodadaBuscada = 1;      // primeiraRodada
        const ultimaRodada = 19;    // devemos buscar a ultima rodada
    }

    // descarta
    await doc.deleteOne(doc._id);

    next();
    //const teste = await this.deleteOne(this._id);

    const chicano = await Chicano.findById(this.idChicano);
    let rodadaBuscada = 1; // primeiraRodada
    const ultimaRodada = 19; // buscar a ultima rodada

    this.rodadas = [];

    while (rodadaBuscada <= ultimaRodada){
        const retornoCartola = await cartola(process.env.CARTOLA_TIME+'/'+chicano.idTime+'/'+rodadaBuscada);
        this.rodadas.push({ 
            rodada: rodadaBuscada,
            jogadores: retornoCartola.atletas,
            pontos : retornoCartola.pontos,
            pontosCampeonato : retornoCartola.pontos_campeonato
         });
        rodadaBuscada++;
    };

*/
//});

module.exports = mongoose.model('Historico',HistoricoSchema);