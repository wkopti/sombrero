const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Confronto = require('../models/Confronto');

/*
exports.validarConfronto = async ( confronto ) => {
    const confrontoEncontrado = await Confronto.find({ idCampeonato: confronto.idCampeonato, jogadores: confronto.jogadores });

    if(confrontoEncontrado.length > 0){
        confronto = confrontoEncontrado;
    } else {
        confronto = await Confronto.create(confronto);
    }

    return confronto;
};
*/

async function retornarIdConfrontos(arrConfrontos){
    let confrontos = [];
    
    for(var i = 0; i < arrConfrontos.length; i++){
        let confronto = arrConfrontos[i];
        
        const confrontoEncontrado = await Confronto.find({ idCampeonato: confronto.idCampeonato, jogadores: confronto.jogadores });

        if(confrontoEncontrado.length > 0){
            confronto = confrontoEncontrado;
        } else {
            confronto = await Confronto.create(confronto);
        };

        confrontos.push(confronto._id);

    };

    return confrontos;
}

exports.retornarConfrontosGrupoCampeonato = async ( idCampeonato, rodadaInicioCartola,  arrGrupoCampeonato ) => {
    let confrontos = [];
    let confrontosRetornados = [];
    let qtdJogosGrupoParticipante = arrGrupoCampeonato.length / 2;
    let jogadoresA = arrGrupoCampeonato.slice();
    let jogadoresB = arrGrupoCampeonato.slice();
    
    // Definir os confrontos
    for(var i = 0; i < jogadoresA.length; i++){
        for(var j = 0; j < jogadoresB.length; j++){
            for(var r = 0; r < qtdJogosGrupoParticipante; r++){
                let rodadaCartola = rodadaInicioCartola + r;
                if (jogadoresA[i] !== jogadoresB[j]){
                    let jogosEncontrados = confrontos.filter(confronto => confronto.jogadores.includes(jogadoresA[i]) && confronto.jogadores.includes(jogadoresB[j]));
                    if(!jogosEncontrados.length > 0){
                        let jogoRodadaAtual = confrontos.filter(confronto => confronto.rodadaCartola == rodadaCartola && confronto.jogadores.includes(jogadoresA[i]));
                        if(!jogoRodadaAtual.length > 0){
                            jogoRodadaAtual = confrontos.filter(confronto => confronto.rodadaCartola == rodadaCartola && confronto.jogadores.includes(jogadoresB[j]));
                            if(!jogoRodadaAtual.length > 0){
                                confrontos.push({ rodadaCartola, jogadores: [jogadoresA[i], jogadoresB[j]], idCampeonato});
                            };
                        };
                    };
                };
            };
        };
    };

    confrontosRetornados = await retornarIdConfrontos(confrontos);

    return confrontosRetornados;
};