// Sort by price high to low
//console.log(homes.sort(sort_by('price', true, parseInt)));
// Sort by city, case-insensitive, A-Z
//console.log(homes.sort(sort_by('city', false, (a) =>  a.toUpperCase()
function ordernar(field, reverse, primer) {

    const key = primer ?
        function (x) {
            return primer(x[field]);
        } :
        function (x) {
            return x[field];
        };

    reverse = !reverse ? 1 : -1;

    return function (a, b) {
        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
    };
};

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

function dividirEmGrupos(array, qtdGrupos){
    var qtdParticipantesGrupo = Math.trunc( array.length / qtdGrupos);
    var gruposDefinidos = [];

    while ( gruposDefinidos.length < qtdGrupos){
        var participantesGrupo = [];
        participantesGrupo = array.splice(0,qtdParticipantesGrupo);
        gruposDefinidos.push(participantesGrupo);
    };

    return gruposDefinidos;
};

function gerarConfrontoGrupo(array){
    let confrontos = [];
    let qtdJogosGrupo = array.length / 2;
    let jogadoresA = array.slice();
    let jogadoresB = array.slice();
    let rodada;

    for(var i = 0; i < jogadoresA.length; i++){
        for(var j = 0; j < jogadoresB.length; j++){
            for(var r = 0; r < qtdJogosGrupo; r++){
                rodada = r;
                if (jogadoresA[i] !== jogadoresB[j]){
                    let jogosEncontrados = confrontos.filter(confronto => confronto.jogadores.includes(jogadoresA[i]) 
                                                                       && confronto.jogadores.includes(jogadoresB[j]));
                    if(!jogosEncontrados.length > 0){
                        let jogoRodadaAtual = confrontos.filter(confronto => confronto.rodada == rodada 
                                                                          && confronto.jogadores.includes(jogadoresA[i]));
                        if(!jogoRodadaAtual.length > 0){
                            jogoRodadaAtual = confrontos.filter(confronto => confronto.rodada == rodada 
                                                                          && confronto.jogadores.includes(jogadoresB[j]));
                            if(!jogoRodadaAtual.length > 0){
                                confrontos.push({ rodada, 
                                                  jogadores: [
                                                     jogadoresA[i], 
                                                     jogadoresB[j] 
                                                ]});
                            };
                        };
                    };
                };
            };
        };
    };

    return confrontos;
};

module.exports = { ordernar, embaralhar, dividirEmGrupos, gerarConfrontoGrupo };