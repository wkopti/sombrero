const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Campeonato = require('../models/Campeonato');
const confronto = require('./confronto');
const Confronto = require('../models/Confronto');
const funcoesArray = require('../utils/funcoesArray');

exports.getClassificaoGrupos = async(campeonato) => {
    const grupos = campeonato.grupos;
    const gruposClassificacao = [];

    for (let index = 0; index < grupos.length; index++) {
        const grupo = grupos[index];
        let grupoResultados = [];
        let grupoPontuacao = [];
        grupo.confrontos.forEach(confronto => {
            if (confronto.encerrado === true){
                confronto.jogadores.forEach(jogador => {
                    let pontos;
                    let saldo;

                    // Quem venceu
                    if (jogador.jogador.toString() === confronto.vencedor.toString()){
                        pontos = 3;
                        saldo = confronto.saldo;
                    } else {
                        pontos = 0;
                        saldo = confronto.saldo * -1;
                    }
                    grupoResultados.push({ jogador: jogador.jogador, pontos, saldo })
                });
            };  
        });

        grupo.participantes.forEach(participante => {
            const resultadosParticipante = grupoResultados.filter((resultado) => resultado.jogador.toString() === participante.toString());
            const totalPontos = funcoesArray.somarPorChave(resultadosParticipante,'pontos');
            const saldoFinal = funcoesArray.somarPorChave(resultadosParticipante,'saldo');
            grupoPontuacao.push({ grupo: grupo._id, jogador: participante, totalPontos, saldoFinal});
        });


        // tem que arrumar aqui
        grupoPontuacao.sort(function(a, b){
            if (a.totalPontos < b.totalPontos) {
                if ((a.totalPontos < b.totalPontos)){
                    return 2;
                }
                else {
                    return -1;
                }
            } else {
                return 3;
            }
            return (a.totalPontos < b.totalPontos) ? 1 : -1;
        });

        gruposClassificacao.push(grupoPontuacao);

    };

    return gruposClassificacao;
};

exports.getCampeonatosEmAberto = async() => {
    const campeonatos = await Campeonato.find({ encerrado: false, iniciado: true }).populate('grupos.confrontos');
    return campeonatos;
};

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
    const campeonato = await (await Campeonato.findById(req.params.id).populate('participantes').populate('grupos.confrontos'));

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

    let arrayParticipantes = campeonato.participantes.slice();

    arrayParticipantes = funcoesArray.embaralhar(arrayParticipantes);
    arrayParticipantes = funcoesArray.dividirEmGrupos(arrayParticipantes, campeonato.qtdGrupos);
    campeonato.grupos = [];

    for (i = 0; i < arrayParticipantes.length; i++){
        let confrontosGrupos = funcoesArray.gerarConfrontoGrupo(arrayParticipantes[i]);
        const confrontos = await confronto.gravarConfrontosGrupoCampeonato(campeonato._id, campeonato.rodadaInicio, confrontosGrupos);

        campeonato.grupos.push({
            nomeGrupo: "Grupo "+i,
            participantes: arrayParticipantes[i],
            confrontos: confrontos
        });
    };

    campeonato.iniciado = true;
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

    const confrontos = await Confronto.find({ idCampeonato: campeonato._id})

    res.status(200)
        .json(
            { success: true, 
              data: confrontos
            });

});

// @desc        Gerar confrontos campeonato
// @route       POST /api/v1/campeonato/classificacao/:id
// @access      Publico
exports.classificacaoCampeonato = asyncHandler(async (req, res, next) => {
    const campeonato = await Campeonato.findById(req.params.id);

    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    let confrontos = []

    if (campeonato.tipoCopa) {
        // Resultado dos jogos dos grupos
        for (var i = 0; i < campeonato.grupos.length; i++){
            /*
            .populate({ 
                path: "jogadores",
                select: "nome timeCartola _id"
            })
            .populate({ 
                path: "vencedor",
                select: "timeCartola _id"
            })
            */
            // Buscar todos os confrontos do grupo
            const confrontos = await Confronto.find({"_id": { $in: campeonato.grupos[i].confrontos}});
            console.log(confrontos);
        };
    };

    res.status(200)
        .json(
            { success: true, 
              data: campeonato
            });
});