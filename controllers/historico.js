const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Historico = require('../models/Historico');
const Chicano = require('../models/Chicano');

// @desc        Pegar o historico de um usuario (uma ou n rodadas)
// @route       GET /api/v1/historico/:idChicano/:idRodada
// @access      Publico
exports.getHistorico = asyncHandler(async (req, res, next) => {
    let query;

    req.body.idChicano = req.params.idChicano;


    const chicano = await Chicano.findById(req.params.id);

    if(!chicano){
        return next(
            new ErrorResponse(`Chicano nao com o id ${req.params.id} no equiziste`, 404)
        );
    };

});

// @desc        Criar um historico
// @route       POST /api/v1/historico
// @access      Publico
exports.createHistorico = asyncHandler(async (req, res, next) => {
    const historico = await Historico.create(req.body);

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