const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Rodada = require('../models/Rodada');
const cartola = require('../utils/cartola');

async function retornarPartidasCartola() {
    const rodadasCartola = await Rodada.findOne({});
    return rodadasCartola.cartolaPartidas.partidas;
};

exports.retornarPartidas = async function () {
    const rodadas = await retornarPartidasCartola();
    const partidas = rodadas.cartolaPartidas.partidas;
    return partidas;
};

exports.retornarPartidasValidas = async function () {
    const rodadas = await retornarPartidasCartola();
    const partidasValidas = rodadas.filter(function(partida) {
        return partida.valida === true;
    });
    return partidasValidas;
};

exports.retornarPartidasEmAberto = async function() {
    const dataAtual = new Date;
    const partidasValidas = await this.retornarPartidasValidas();
    const partidasEmAberto = partidasValidas.filter(function(partida) {
        let dataPartida = new Date(partida.partida_data);
        let dataPartidaFim = new Date(dataPartida);
        dataPartidaFim.setHours(dataPartidaFim.getHours() + 2);
        return dataPartida >= dataAtual.getTime() && dataAtual.getTime() <= dataPartidaFim.getTime();
    });
    return partidasEmAberto;
}

async function retornarRodadaCartola() {
    const retornoCartolaRodada = await cartola(process.env.CARTOLA_MERCADO_STATUS);
    const retornoCartolaRodadas = await cartola(process.env.CARTOLA_RODADAS);
    const retornoCartolaPartidas = await cartola(process.env.CARTOLA_PARTIDAS);
    let rodadaNova = new Rodada();
    rodadaNova.rodadaAtual = retornoCartolaRodada.rodada_atual;
    rodadaNova.statusMercado = retornoCartolaRodada.status_mercado;
    rodadaNova.temporada = retornoCartolaRodada.temporada;
    rodadaNova.fechamento = retornoCartolaRodada.fechamento;
    rodadaNova.rodadas = retornoCartolaRodadas;
    rodadaNova.cartolaPartidas = retornoCartolaPartidas;
    Rodada.create(rodadaNova);
    return rodadaNova;
}

exports.recarregarRodada = async function (){
    let rodada;
    rodada = await Rodada.findOneAndDelete({});
    rodada = await retornarRodadaCartola();
    return rodada;
}

exports.retornarRodada = async function () {
    rodada = await Rodada.findOne({});

    // se nao existe, carrega a rodada atual
    if (!rodada){
        rodada = await retornarRodadaCartola();
    };

    return rodada;
};

exports.getRodada = asyncHandler(async (req, res, next) => {

    const rodada = await retornarRodada();

    res.status(201).json({
        success: true,
        data: rodada
    });

});