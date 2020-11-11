const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Historico = require('../models/Historico');
const Chicano = require('../models/Chicano');
const cartola = require('../utils/cartola');
const rodada = require('./rodada');

exports.deletarHistorico = async (idChicano) => {
    await Historico.deleteMany({ idChicano: idChicano });
};

async function retornarHistoricoRodada (idChicano, rodada){
    
    let query = { idChicano: idChicano, 
                   'rodada': rodada };
    
    let historico = await Historico.findOne(query);

    if(!historico){
        const chicano = await Chicano.findById(idChicano);
        const retornoCartola = await cartola(process.env.CARTOLA_TIME+'/'+chicano.idTime+'/'+rodada);

        historico = { 
                        idChicano: chicano._id,
                        rodada: rodada,
                        retornoCartola: retornoCartola,
                        pontos: retornoCartola.pontos,
                        pontosCampeonato: retornoCartola.pontos_campeonato
                    };

        Historico.create(historico);
    };

    return historico;

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
    const rodadaAtual = await rodada.retornarRodada();
    let historico;

    if(!chicano){
        return next(
            new ErrorResponse(`idChicano informado no equiziste`, 404)
        );
    }

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