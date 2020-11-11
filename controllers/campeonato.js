const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Campeonato = require('../models/Campeonato');
const confronto = require('./confronto');
const Confronto = require('../models/Confronto');

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

    confronto.deletarConfrontosCampeonato(req.params.id);

    res.status(200).json({ success: true, data: {}});
});

// @desc        Sortear grupos campeoando
// @route       POST /api/v1/campeonato/sortear/:id
// @access      Publico
exports.sortearCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await Campeonato.findById(req.params.id);
    
    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    if(!campeonato.tipoCopa || campeonato.sorteioRealizado){
        return next(
            new ErrorResponse(`Nao pode realizar sorteio para este campeonato - ${campeonato.nome}`, 404)
        );
    };

    if(!((campeonato.participantes.length % 2) === 0)){
        return next(
            new ErrorResponse(`A quantidade de participantes deve ser par`, 404)
        );
    };

    if(!(((campeonato.participantes.length / campeonato.qtdGrupos) % 2) === 0)){
        return next(
            new ErrorResponse(`A quantidade de participantes por grupo deve ser par`, 404)
        );
    }

    function embaralhar(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
      
          // And swap it with the current element.
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
      
        return array;
    };

    function dividirGrupos(participantes, qtdGrupos){
        var poteParticipantes = participantes;
        var qtdParticipantesGrupo = Math.trunc( poteParticipantes.length / qtdGrupos);
        var gruposDefinidos = [];

        while ( gruposDefinidos.length < qtdGrupos){
            var participantesGrupo = [];
            participantesGrupo = poteParticipantes.splice(0,qtdParticipantesGrupo);
            gruposDefinidos.push(participantesGrupo);
        };

        return gruposDefinidos;

    };

    let arrayParticipantes = campeonato.participantes.slice();
    embaralhar(arrayParticipantes);

    let gruposDefinidos = dividirGrupos(arrayParticipantes, campeonato.qtdGrupos);
    let gruposCampeonato = [];
    
    for (i = 0; i < gruposDefinidos.length; i++){
        let confrontosGrupo = await confronto.retornarConfrontosGrupoCampeonato(campeonato._id, campeonato.rodadaInicio, gruposDefinidos[i]);
        gruposCampeonato.push({ nomeGrupo: 'Grupo '+ i , participantes: gruposDefinidos[i], confrontos: confrontosGrupo});     
    };

    campeonato.grupos = gruposCampeonato;
    campeonato.sorteioRealizado = true;

    await campeonato.save();
    
    res.status(200).json({ success: true, data: campeonato});

});

// @desc        Gerar confrontos campeonato
// @route       POST /api/v1/campeonato/confrontos/:id
// @access      Publico
exports.confrontosCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await Campeonato.findById(req.params.id);
    
    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    if(!campeonato.sorteioRealizado){
        return next(
            new ErrorResponse(`Deve-se gerar o sorteio para este campeonato - ${campeonato.nome}`, 404)
        );
    };

    res.status(200)
        .json(
            { success: true, 
              data: campeonato
            });

});