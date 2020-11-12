const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Confronto = require('../models/Confronto');
const rodada = require('../controllers/rodada');
const funcoesArray = require('../utils/funcoesArray');

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

    if (this.rodadaCartola < rodadaAtual.rodadaAtual) {
        let jogadorA = this.jogadores[0];
        let jogadorB = this.jogadores[1];
        let pontuacaoJogadorA = await historico.buscarPontuacaoRodada(jogadorA, this.rodadaCartola);
        let pontuacaoJogadorB = await historico.buscarPontuacaoRodada(jogadorB, this.rodadaCartola);

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
    const confronto = await this.getConfrontoDetalhado(req.params.id);

    if(!confronto){
        return next(
            new ErrorResponse(`Confronto nao encontrado com o id ${req.params.id}`, 404)
        );
    };

    res.status(201).json({
        success: true,
        data: confronto
    });
});