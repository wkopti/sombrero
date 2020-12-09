const Pontuacao = require('../models/Pontuacao');
const cartola = require('../utils/cartola');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const escalacao = require('./escalacao');

exports.carregarPontuacaoCartola = async () => {
    try {
        let tsAgora = new Date();
        let pontuacaoCartola = await Pontuacao.findOne({});

        try {
            let retornoCartola = await cartola(process.env.CARTOLA_PONTUACAO_PARCIAL);
            if (pontuacaoCartola && retornoCartola){
                pontuacaoCartola.rodada = retornoCartola.rodada;
                pontuacaoCartola.atletas = retornoCartola.atletas;
                pontuacaoCartola.clubes = retornoCartola.clubes;
                pontuacaoCartola.posicoes = retornoCartola.posicoes;
                pontuacaoCartola.total_atletas = retornoCartola.total_atletas;
                pontuacaoCartola.atualizadoEm = tsAgora;
                pontuacaoCartola.save(); 
            } else if (!pontuacaoCartola && retornoCartola) {
                await Pontuacao.create(retornoCartola);
            };
        } catch (error) {
            console.log(`Erro na pontuacao parcial ${error}`)
        };
    } catch (error) {
        console.log(error)
    };
};

exports.pontuacaoChicano = asyncHandler(async (req, res, next) => {
    const idChicano = req.params.id;
    const retornoEscalacaoChicano = await escalacao.retornarEscaladao(idChicano);
    const escalacaoChicano = retornoEscalacaoChicano.map(retorno => retorno.retornoCartola.atletas );
    const pontuacaoCartola = await Pontuacao.findOne({});
    const atletas = []; 
    Object.entries(pontuacaoCartola.atletas).forEach(([chave, valor]) => {
        atletas.push({ atleta_id: parseInt(chave), 
                       pontuacao: valor.pontuacao
                    });
    });
    const clubes = Object.values(pontuacaoCartola.clubes);
    const posicoes = Object.values(pontuacaoCartola.posicoes);

    let pontuacaoParcial = 0;
    //escalacaoChicano[0].forEach(jogador => {
    //    let pontuacaoJogador = atletas.find(atleta => { 
    //        if (atleta.atleta_id === jogador.atleta_id) {
    //            return atleta.pontuacao;
    //        } });
    //    console.log(pontuacaoJogador)
    //    jogador.pontuacao = pontuacaoJogador;
    //});

    console.log(escalacaoChicano)

    //console.log(atletas.find(elemento => elemento == 36943))
    //console.log(atletas[0])

    /*
    80853
    71162
    80287
    78850
    104276
    86485
    72391
    87863
    38509
    94509
    90285
    52253
    */
    

});