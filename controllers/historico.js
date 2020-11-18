const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Historico = require('../models/Historico');
const Chicano = require('../models/Chicano');
const cartola = require('../utils/cartola');
const rodada = require('./rodada');

async function retornarHistoricoRodada (idChicano, historicoRodada){
    const rodadaBase = await rodada.retornarRodada();

    if (historicoRodada >= rodadaBase.rodadaAtual){
        return null;
    };
    
    let query = { idChicano: idChicano, 
                   'rodada': historicoRodada };
    
    let historico = await Historico.findOne(query);

    if(!historico){
        const chicano = await Chicano.findById(idChicano);
        const retornoCartola = await cartola(process.env.CARTOLA_TIME+'/'+chicano.idTime+'/'+historicoRodada);

        historico = { 
                        idChicano: chicano._id,
                        rodada: historicoRodada,
                        retornoCartola: retornoCartola,
                        pontos: retornoCartola.pontos,
                        pontosCampeonato: retornoCartola.pontos_campeonato
                    };

        Historico.create(historico);
    };

    return historico;

};

exports.obterHistoricoJogadoresRodada = async (arrJogadores, rodadaCartola) => {
    const rodadaAtual = await rodada.retornarRodada();
    const historico = await Historico.find({"idChicano": { $in: arrJogadores}, "rodada": rodadaCartola })
                                     .select('idChicano pontos pontosCampeonato id')
                                     .populate('idChicano');
                                     //console.log(historico);
                                     //console.log("passou");
    if (arrJogadores.length !== historico.length){
        if (rodadaCartola < rodadaAtual.rodadaAtual){
            let jogadoresValidados = 0;

            // Verificar qual jogador nao possui o historico
            for (let index = 0; index < arrJogadores.length; index++) {
                const jogador = arrJogadores[index];
                const indice = historico.findIndex(historico => historico.idChicano.id.toString() === jogador.toString());
                if (indice === -1 ) {
                    const historicoJogador = await retornarHistoricoRodada(jogador, rodadaCartola);
                    if (historicoJogador) {
                        jogadoresValidados++;
                    }
                } else {
                    jogadoresValidados++;
                }
            };

            if (arrJogadores === jogadoresValidados){
                console.log("Tudo ok")
                const historico = await Historico.find({"idChicano": { $in: arrJogadores}, "rodada": rodadaCartola })
                                     .select('idChicano pontos pontosCampeonato id')
                                     .populate('idChicano');
                return historico;
            };
            return null;

        } else {
            return null;
        };
    };

    return historico;
};


exports.deletarHistorico = async (idChicano) => {
    await Historico.deleteMany({ idChicano: idChicano });
};

exports.buscarPontuacaoRodada = async (idChicano, rodada) => {

    let historico = await retornarHistoricoRodada(idChicano, rodada);
    return historico.pontos;
};

exports.carregarHistorico = async (idChicano, rodadaInicio, rodadaFim) => {

    let historico = [];

    if(!rodadaFim){
        const rodadaAtual = await rodada.retornarRodada();
        rodadaFim = rodadaAtual.rodadaAtual;
    }

    while (rodadaInicio < rodadaFim) {
        let rodadaBuscada = { idChicano: idChicano, rodada: rodadaInicio };
        historico.push(rodadaBuscada);
        rodadaInicio++;
    };

    Historico.create(historico);

    return historico;
};

// @desc        Pegar o historico de um usuario (uma ou n rodadas)
// @route       GET /api/v1/historico/:idChicano/
// @route       GET /api/v1/historico/:idChicano/:idRodada
// @access      Publico
exports.getHistorico = asyncHandler(async (req, res, next) => {
    const chicano = await Chicano.findById(req.params.idChicano);
    let query;
    let msgRetorno;

    const rodadaAtual = await rodada.retornarRodada();

    if (req.params.idRodada >= rodadaAtual.rodadaAtual) {
        return next(
            new ErrorResponse(`A rodada ${req.params.idRodada} nao esta encerrada`, 404)
        );
    };

    if(!chicano){
        return next(
            new ErrorResponse(`Chicano com o id ${req.params.id} no equiziste`, 404)
        );
    };

    if (req.params.idRodada){
        query = { idChicano: chicano._id, 
                  'rodada': req.params.idRodada };
        msgRetorno = `Historico da rodada ${req.params.idRodada}`;
    }else{
        query = { idChicano: chicano._id };
        msgRetorno = `Historico`;
    };
    
    const historico = await Historico.find(query);

    if(historico.length === 0){
        return next(
            new ErrorResponse(`${msgRetorno} do ${chicano.timeCartola} (${chicano.nome}) no equiziste`, 404)
        );
    };

    res.status(201).json({
        success: true,
        data: historico
    });

});

// @desc        Criar historico
// @route       POST /api/v1/historico
// @access      Publico
exports.createHistorico = asyncHandler(async (req, res, next) => {
    const chicano = await Chicano.findById(req.body.idChicano);

    if(!chicano){
        return next(
            new ErrorResponse(`idChicano informado no equiziste`, 404)
        );
    }

    const rodadaAtual = await rodada.retornarRodada();
    let historico;

    if(!req.body.rodada){

        let historicoExistente = await Historico.find({ idChicano: chicano._id });

        if (historicoExistente.length > 0){
            await Historico.deleteMany({ idChicano: chicano._id });
        }

        historico = await this.carregarHistorico(chicano._id, 1, rodadaAtual.rodadaAtual);

    };

    res.status(201).json({
        success: true,
        data: historico
    });
});

// @desc        Deletar um historico
// @route       POST /api/v1/historico/:id
// @access      Publico
exports.deleteHistorico = asyncHandler(async (req, res, next) => {
    const historico = await Historico.findByIdAndDelete(req.params.id);
    
    if(!historico){
        return next(
            new ErrorResponse(`Historico nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({ success: true, data: {}});
});