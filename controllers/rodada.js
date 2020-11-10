const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Rodada = require('../models/Rodada');
const cartola = require('../utils/cartola');

exports.retornarRodada = async function () {
    rodada = await Rodada.find({});

    // se nao existe, carrega a rodada atual
    if (rodada.length === 0){

        const retornoCartola = await cartola.consultarSite(process.env.CARTOLA_MERCADO_STATUS);
        let rodadaNova = new Rodada();
        rodadaNova.rodadaAtual = retornoCartola.rodada_atual;
        rodadaNova.statusMercado = retornoCartola.status_mercado;
        rodadaNova.temporada = retornoCartola.temporada;
        rodadaNova.fechamento = retornoCartola.fechamento;
        Rodada.create(rodadaNova);
        rodada[0] = rodadaNova;
        
    };

    return rodada[0];
}

/*
exports.retornarRodada = asyncHandler(async () => {
    rodada = await Rodada.find({});

    // se nao existe, carrega a rodada atual
    if (rodada.length === 0){
        console.log('vou criar a rodada');
        const retornoCartola = await cartola.consultarSite(process.env.CARTOLA_MERCADO_STATUS);
        let rodadaNova = new Rodada();
        rodadaNova.rodadaAtual = retornoCartola.rodada_atual;
        rodadaNova.statusMercado = retornoCartola.status_mercado;
        rodadaNova.temporada = retornoCartola.temporada;
        rodadaNova.fechamento = retornoCartola.fechamento;
        Rodada.create(rodadaNova);
        rodada[0] = rodadaNova;
    };

    return rodada[0];

});
*/

exports.getRodada = asyncHandler(async (req, res, next) => {

    const rodada = await retornarRodada();

    res.status(201).json({
        success: true,
        data: rodada
    });

});