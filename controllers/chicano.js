const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Chicano = require('../models/Chicano');

// @desc        Pegar todos os participantes
// @route       GET /api/v1/chicano
// @access      Publico
exports.getChicanos = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc        Pegar um participante
// @route       GET /api/v1/chicano/:id
// @access      Publico
exports.getChicano = asyncHandler(async (req, res, next) => {
    //try {
        const chicano = await Chicano.findById(req.params.id);

        if(!chicano){
            return next(
                new ErrorResponse(`Chicano nao encontrado com o id ${req.params.id}`, 404)
            );
        };

        res.status(200).json({
            success: true,
            data: chicano
        });
    //} catch (err) {
        //res.status(400).json({
        //    success: false
        //});

    //    next(err);

        //next(new ErrorResponse(`Chicano nao encontrado com o id ${req.params.id}`, 404));
    //};
});

// @desc        Criar um participante
// @route       POST /api/v1/chicano/:id
// @access      Publico
exports.createChicano = asyncHandler(async (req, res, next) => {
    const chicano = await Chicano.create(req.body);

    res.status(201).json({
        success: true,
        data: chicano
    });
});

// @desc        Atualizar um participante
// @route       POST /api/v1/chicano/:id
// @access      Publico
exports.updateChicano = asyncHandler(async (req, res, next) => {
    const chicano = await Chicano.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!chicano){
        return next(
            new ErrorResponse(`Chicano nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({ success: true, data: chicano});
});

// @desc        Deletar um participante
// @route       POST /api/v1/chicano/:id
// @access      Publico
exports.deleteChicano = asyncHandler(async (req, res, next) => {
    const chicano = await Chicano.findByIdAndDelete(req.params.id);
    
    if(!chicano){
        return next(
            new ErrorResponse(`Chicano nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({ success: true, data: {}});
});