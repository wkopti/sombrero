const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Confronto = require('../models/Confronto');
const Chicano = require('../models/Chicano');
const rodada = require('../controllers/rodada');
const historico = require('../controllers/historico');
const funcoesArray = require('../utils/funcoesArray');


exports.confrontosFinalizados = async(arrConfrontos) => {
    const confrontos = await Confronto.find({"_id": { $in: arrConfrontos}, encerrado: true});
    //return (confrontos.length) === arrConfrontos.length ? true : false;
    return confrontos;
};

exports.obterResultadoConfronto = async (confronto) => {
    const rodadaCartola = await rodada.retornarRodada();
    let arrJogadores = [];

    if (confronto.rodadaCartola < rodadaCartola.rodadaAtual) {

        // Se for um confronto de mata mata 
        if(confronto.linkMataMata.jogos.length > 0){
            const confrontos = await Confronto.find({"_id": { $in: confronto.linkMataMata.jogos}});
            
            if(confrontos.length === confronto.linkMataMata.jogos.length){
                const vencedores = [];
                const perdedores = [];
                confrontos.forEach(element => {
                    element.jogadores.sort(funcoesArray.ordernar('pontuacao', true));
                    let jogadores = element.jogadores.slice();
                    vencedores.push(jogadores[0]);
                    perdedores.push(jogadores[1]);
                });
                if(confronto.linkMataMata.vencedores){
                    while (vencedores.length > 0){
                        let vencedor = vencedores.splice(0,1);
                        confronto.jogadores.push({jogador: vencedor[0].jogador});
                    }; 
                }else{
                    while (perdedores.length > 0){
                        let perdedor = perdedores.splice(0,1);
                        confronto.jogadores.push({jogador: perdedor[0].jogador});
                    };
                };
            };
            await confronto.save();
        };

        confronto.jogadores.forEach(element => {
            arrJogadores.push(element.jogador);
        });
    };

    const historicoJogadores = await historico.obterHistoricoJogadoresRodada(arrJogadores,confronto.rodadaCartola);

    if (historicoJogadores){

        confronto.jogadores.forEach(element => {
            let historicoJogador = historicoJogadores.find(historico => historico.idChicano.id === (element.jogador).toString());
            element.pontuacao = historicoJogador.pontos;
        });
        
        confronto.jogadores = confronto.jogadores.sort(funcoesArray.ordernar('pontuacao', true));
        confronto.vencedor = confronto.jogadores[0].jogador;
        
        if(confronto.jogadores.length == 2){
            confronto.saldo = confronto.jogadores[0].pontuacao - confronto.jogadores[1].pontuacao;
        };

        confronto.encerrado = true;
        confronto.save();

    };

    return confronto;
};

exports.gravarConfrontosGrupoCampeonato = async (idCampeonato, rodadaInicioCartola, arrConfrontos) => {
    let confrontosGerados = [];
    for(var i = 0; i < arrConfrontos.length; i++){
        let confronto = arrConfrontos[i];
        let jogadores = confronto.jogadores.slice();
        confronto.rodadaCartola = confronto.rodada + rodadaInicioCartola;
        confronto.idCampeonato = idCampeonato;
        delete confronto.rodada;
        confronto.jogadores = [];
        jogadores.forEach(jogador => {
            confronto.jogadores.push({jogador, pontuacao: null});
        });
        confrontosGerados.push(confronto);
    };

    confrontosGerados = await Confronto.insertMany(confrontosGerados);

    return confrontosGerados;
};

exports.deletarConfrontosCampeonato = async (idCampeonato) => {
    await Confronto.deleteMany({ idCampeonato: idCampeonato });
};

exports.getConfrontosEmAberto = async (rodadaAndamento) => {
    const confrontos = await Confronto.find({ rodadaCartola: { $lt: rodadaAndamento }, encerrado: false });
    return confrontos;
};

exports.getConfrontosCampeonato = async (idCampeonato) => {
    const confrontos = await Confronto.find({ idCampeonato });
    return confrontos;
};

exports.getConfrontoDetalhado = async (idConfronto) => {
    const confronto = await Confronto.findById(idConfronto);
    return confronto;
};

exports.atualizarResultadoConfronto = async (idConfronto) => {
    const confronto = await Confronto.findById(idConfronto);
    const rodadaAtual = await rodada.retornarRodada();

    confronto.encerrado = false;
    confronto.vencedor = null;
    confronto.saldo = null;

    if (confronto.rodadaCartola < rodadaAtual.rodadaAtual) {

        let jogadorA = confronto.jogadores[0];
        let jogadorB = confronto.jogadores[1];
        let pontuacaoJogadorA = await historico.buscarPontuacaoRodada(jogadorA, confronto.rodadaCartola);
        let pontuacaoJogadorB = await historico.buscarPontuacaoRodada(jogadorB, confronto.rodadaCartola);

        // Se houve retorno, sem falhas
        if (pontuacaoJogadorA && pontuacaoJogadorB){
            if (pontuacaoJogadorA > pontuacaoJogadorB){
                confronto.vencedor = jogadorA;
                confronto.saldo = pontuacaoJogadorA - pontuacaoJogadorB;
            } else {
                confronto.vencedor = jogadorB;
                confronto.saldo = pontuacaoJogadorB - pontuacaoJogadorA;
            };
    
            confronto.encerrado = true;
        };
    };

    confronto.save();
    
    return confronto;
};

// @desc        Atualizar um confronto
// @route       PUT /api/v1/confronto/:id
// @access      Publico
exports.updateConfronto = asyncHandler(async (req, res, next) => {
    const confronto = await this.atualizarResultadoConfronto(req.params.id);

    if(!confronto){
        return next(
            new ErrorResponse(`Confronto nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(200).json({ success: true, data: confronto});
});

// @desc        Criar um confronto
// @route       POST /api/v1/confronto/:id
// @access      Publico
exports.createConfronto = asyncHandler(async (req, res, next) => {
    const jogadores = req.body.jogadores.slice();

    if(jogadores < 2){
        return next(
            new ErrorResponse(`Pelo menos 2 jogadores sao necessarios para um confronto`, 404)
        );
    }

    let buscarJogadores = [];

    jogadores.forEach(jogador => {
        buscarJogadores.push(jogador.jogador);
    });

    const chicano = await Chicano.find({"_id": { $in: buscarJogadores}});

    if(jogadores.length !== chicano.length ){
        return next(
            new ErrorResponse(`Há algum chicano errado na lista de jogadores => ${buscarJogadores}`, 404)
        );
    };

    const confronto = await Confronto.create(req.body);
    
    res.status(201).json({
        success: true,
        data: confronto
    });
});

// @desc        Obter um confronto
// @route       GET /api/v1/confronto/:id
// @access      Publico
exports.getConfronto = asyncHandler(async (req, res, next) => {
    let confronto = await this.getConfrontoDetalhado(req.params.id);

    if(!confronto){
        return next(
            new ErrorResponse(`Confronto nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    if (!confronto.encerrado){
        confronto = await this.obterResultadoConfronto(confronto);
    };
    
    res.status(201).json({
        success: true,
        data: confronto
    });
});