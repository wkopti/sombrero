const Pontuacao = require('../models/Pontuacao');
const cartola = require('../utils/cartola');

exports.carregarPontuacaoCartola = async (idJob, tsInicioPartida, tsFinalPartida) => {
    try {
        let tsAgora = new Date();
        tsAgora = tsAgora.getTime();
        let pontuacaoCartola = await Pontuacao.findOne({});
        let retornoCartola = await cartola(process.env.CARTOLA_PONTUACAO_PARCIAL);

        if ( tsAgora >= tsInicioPartida && tsAgora <= tsFinalPartida){
            if (pontuacaoCartola && retornoCartola){
                pontuacaoCartola.rodada = retornoCartola.rodada;
                pontuacaoCartola.atletas = retornoCartola.atletas;
                pontuacaoCartola.clubes = retornoCartola.clubes;
                pontuacaoCartola.posicoes = retornoCartola.posicoes;
                pontuacaoCartola.total_atletas = retornoCartola.total_atletas;
                pontuacaoCartola.save(); 
            } else if (!pontuacaoCartola && retornoCartola) {
                await Pontuacao.create(retornoCartola);
            };
        } else {
            clearInterval(idJob);
        };
    } catch (error) {
        console.log(error)
    };
};