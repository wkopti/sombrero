const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Campeonato = require('../models/Campeonato');
const Chicano = require('../models/Chicano');

// @desc        Pegar todos os campeonatos
// @route       GET /api/v1/campeonato
// @access      Publico
exports.getCampeonatos = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc        Pegar um campeonato
// @route       GET /api/v1/campeonato/:id
// @access      Publico
exports.getCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await (await Campeonato.findById(req.params.id).populate('participantes'));

    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({
        success: true,
        data: campeonato
    });
});

// @desc        Criar um campeonato
// @route       POST /api/v1/campeonato/:id
// @access      Publico
exports.createCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await Campeonato.create(req.body);

   
    res.status(201).json({
        success: true,
        data: campeonato
    });
});

// @desc        Atualizar um campeonato
// @route       POST /api/v1/campeonato/:id
// @access      Publico
exports.updateCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await Campeonato.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({ success: true, data: campeonato});
});

// @desc        Deletar um campeonato
// @route       POST /api/v1/campeonato/:id
// @access      Publico
exports.deleteCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await Campeonato.findByIdAndDelete(req.params.id);
    
    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({ success: true, data: {}});
});