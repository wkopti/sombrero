const mongoose = require('mongoose');
const rodada = require('../controllers/rodada');
const historico = require('../controllers/historico');

const ConfrontoSchema = new mongoose.Schema({
    jogadores: [{
        jogador: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chicano'
        },
        pontuacao: {
            type: Number
        }
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
    },
    idConfrontoAnterior: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Confronto'
    }
});

// Buscar dados da rodada
/*
ConfrontoSchema.pre('save', async function(next){
    const rodadaAtual = await rodada.retornarRodada();

    if (!this.encerrado){

        // Se for uma rodada finalizada
        if (this.rodadaCartola < rodadaAtual.rodadaAtual) {
            let jogadorA = this.jogadores[0];
            let jogadorB = this.jogadores[1];
            let pontuacaoJogadorA = await historico.buscarPontuacaoRodada(jogadorA, this.rodadaCartola);
            let pontuacaoJogadorB = await historico.buscarPontuacaoRodada(jogadorB, this.rodadaCartola);

            // Se houve retorno, sem falhas
            if (pontuacaoJogadorA && pontuacaoJogadorB){
                if (pontuacaoJogadorA > pontuacaoJogadorB){
                    this.vencedor = jogadorA;
                    this.saldo = pontuacaoJogadorA - pontuacaoJogadorB;
                } else {
                    this.vencedor = jogadorB;
                    this.saldo = pontuacaoJogadorB - pontuacaoJogadorA;
                };
        
                this.encerrado = true;
            };
        };
    };

    next();
});
*/

module.exports = mongoose.model('Confronto',ConfrontoSchema);