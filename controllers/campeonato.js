const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Campeonato = require('../models/Campeonato');
const confronto = require('./confronto');
const Confronto = require('../models/Confronto');
const funcoesArray = require('../utils/funcoesArray');

exports.gerarConfrontoMataMata = async( idCampeonato, classificados, rodadaInicioMataMata, jogoUnicoMataMata, jogoUnicoFinal ) => {
    const participantes = classificados.slice();
    const qtdClassificados = classificados.length;
    const qtdValida = [2, 4, 8, 16, 32, 64];
    const confrontosMataMata = [];

    if(!qtdValida.includes(qtdClassificados)){
        return ("Nao tem a qtd necessaria para a geracao de mata mata");
    };

    let qtdFases = (qtdClassificados > 2) ? qtdClassificados / 2 : 1;
    let rodadaCartola = rodadaInicioMataMata;

    while (qtdFases >= 1){
        let confronto;

        // Primeira carga -> Melhor contra pior
        if (confrontosMataMata.length === 0) {
            while(participantes.length > 0){
                let jogadorUm = participantes.splice(0,1);
                let jogadorDois = participantes.splice(-1,1);
                confronto = {
                    jogadores: [{jogador: jogadorUm[0].jogador}, {jogador: jogadorDois[0].jogador}],
                    rodadaCartola,
                    idCampeonato
                };
                confronto = await Confronto.create(confronto);
                confrontosMataMata.push(confronto);
                //if ((qtdFases >= 2 && !jogoUnicoMataMata) || (qtdFases == 1 && !jogoUnicoFinal)){
                //    rodadaCartola++;
                //    confronto = {
                //        jogadores: [jogadorUm[0].jogador, jogadorDois[0].jogador],
                //        rodadaCartola,
                //        idCampeonato
                //    };
                //    confronto = await Confronto.create(confronto);
                //    confrontosMataMata.push(confronto);
                //};
            };
        } else {
            let jogosFaseAnterior = confrontosMataMata.filter(confronto => confronto.rodadaCartola === rodadaCartola);
            if (jogosFaseAnterior){
                rodadaCartola = rodadaCartola + 1;
                while(jogosFaseAnterior.length > 0){
                    let jogoUm = jogosFaseAnterior.splice(0,1);
                    let jogoDois = jogosFaseAnterior.splice(0,1);
                    confronto = {
                        rodadaCartola,
                        idCampeonato,
                        linkMataMata: {
                            vencedores: true,
                            jogos:[jogoUm[0]._id, jogoDois[0]._id]
                        }
                    };
                    confronto = await Confronto.create(confronto);
                    confrontosMataMata.push(confronto);
                    if (qtdFases == 1){
                        confronto = {
                            rodadaCartola,
                            idCampeonato,
                            linkMataMata: {
                                vencedores: false,
                                jogos:[jogoUm[0]._id, jogoDois[0]._id]
                            }
                        };
                        confronto = await Confronto.create(confronto);
                        confrontosMataMata.push(confronto);
                    };
                };
            };
        };
        qtdFases = qtdFases / 2;
    };
    return confrontosMataMata;
};

exports.getClassificaoGrupos = async(campeonato) => {
    const grupos = campeonato.grupos;
    const classificacaoGrupo = [];     // Classificacao de todos os grupos
    const classificados = [];          // Quem passaria para a proxima fase
    const classificacaoGeral = [];     // Classificacao geral independente do grupo

    for (let index = 0; index < grupos.length; index++) {
        const grupo = grupos[index];   // Grupo unitario
        const grupoResultados = [];    // Resultado individual de cada jogo do grupo
        const grupoPontuacao = [];     // Resultado agrupado - Classificacao do grupo

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
            grupoPontuacao.push({ jogador: participante, totalPontos, saldoFinal });
            classificacaoGeral.push({ jogador: participante, totalPontos, saldoFinal });
        });

        // Ordenar a pontuacao do grupo
        grupoPontuacao.sort(funcoesArray.ordernarPorPontoSaldo);
        // Classificacao do grupo atualizada
        classificacaoGrupo.push({ grupoId: grupo._id, nomeGrupo: grupo.nomeGrupo, classificacao: grupoPontuacao})
        // Quem passa para a proxima fase
        grupoPontuacao.slice(0,campeonato.qtdClassificados).forEach(classificado => {
            classificados.push(classificado);
        });
    };

    // Ordenar a classificacao geral
    classificacaoGeral.sort(funcoesArray.ordernarPorPontoSaldo);
    // Ordenar os classificados para a proxima fase
    classificados.sort(funcoesArray.ordernarPorPontoSaldo);

    let retorno = {
       classificacaoGrupo,
       classificacaoGeral,
       classificados
    };

    return retorno;
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
    const campeonato = await Campeonato.findById(req.params.id).populate('mataMata.confrontos').populate('participantes').populate('classificacao.jogador');

    if(!campeonato){
        return next(
            new ErrorResponse(`Campeonato nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200)
        .json(
            { success: true, 
              data: campeonato
            });
});