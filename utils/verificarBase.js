const rodada = require('../controllers/rodada');
const confronto = require('../controllers/confronto');
const campeonato = require('../controllers/campeonato');
const historico = require('../controllers/historico'); 
const funcoesArray = require('./funcoesArray');

async function atualizarConfronto(confrontoAtual) {
    const atualizado = await confronto.obterResultadoConfronto(confrontoAtual);
    return atualizado;
};

const rodadaAtual = async() => {
    let rodadaBase = await rodada.retornarRodada();
    const dataAtual = new Date;
    let rodadaAndamento;
    let rodadas = [];

    rodadaBase.rodadas.forEach(element => {
        rodadas.push(element);
    });

    const rodadaAtualData = rodadas.find(r => dataAtual.getTime() <= r.inicio.getTime()) ;

    console.log('Data atual => '+dataAtual);
    console.log('Timestamp da data atual => '+dataAtual.getTime());
    console.log('Quantas rodadas => '+rodadas.length);
    console.log('Rodada encontrada (com base na data atual) => '+ rodadaAtualData.rodada_id);
    console.log('Timestamp do inicio da rodada encontrada (com base na data atual) => '+ rodadaAtualData.inicio.getTime());
    console.log('Rodada atual carregada no banco => ' + rodadaBase.rodadaAtual);
    
    let msg = "Validando rodada carregada => ";
    
    // Se a rodada esta correta
    if(rodadaAtualData.rodada_id === rodadaBase.rodadaAtual){
        msg = msg+"OK";
        rodadaAndamento = rodadaBase.rodadaAtual;
    
    } else {
        // Quais sao as partidas que valem para o cartola?
        const partidasValidas = await rodada.retornarPartidasValidas();
        // Quais sao as partidas que faltam na rodada?
        const partidasEmAberto = await rodada.retornarPartidasEmAberto();

        let qtdPartidasEmAberto = 0;

        if (partidasEmAberto) {
            qtdPartidasEmAberto = partidasEmAberto.length;
        };

        // Se a rodada esta incorreta, mas ainda nao comecou a proxima rodada e temos jogos em aberto, a rodada está em andamento
        if (dataAtual.getTime() <= rodadaAtualData.inicio.getTime() && qtdPartidasEmAberto > 0){
            rodadaAndamento = rodadaBase.rodadaAtual;
            msg = msg+"Rodada em andamento";
            
            
            // Disparar o scheduler das partidas com tempos em comum das partidas em aberto
            //console.log(partidasEmAberto)
            // O scheduler de cada partida deve


        } else {
            // Devemos deletar o que temos e carregar a nova rodada
            //msg = msg+"NOK";
            msg = msg+"Rodada encerrada";
            rodadaBase = await rodada.recarregarRodada();

    
        };
    };

    console.log(msg);

    // Confrontos
    const confrontos = await confronto.getConfrontosEmAberto(rodadaAndamento);
    confrontos.sort(funcoesArray.ordernar('rodadaCartola', false));

    if (confrontos.length > 0) {
        console.log(`Há ${confrontos.length} confrontos que precisam ser atualizados` );
        for (var i = 0; i < confrontos.length; i++){
            console.log(`Atualizar o confronto => ${confrontos[i]._id}`);
            confrontos[i] = await atualizarConfronto(confrontos[i]);
        };
    };

    // Campeonatos
    const campeonatos = await campeonato.getCampeonatosEmAberto();

    if (campeonatos.length > 0){

        for (let index = 0; index < campeonatos.length; index++) {
            const campeonatoAberto = campeonatos[index];
    
            if(campeonatoAberto.tipoCopa === true && campeonatoAberto.faseGruposEncerrada === false){
                let rodada = campeonatoAberto.grupos[0].confrontos.slice();
                rodada.sort(funcoesArray.ordernar('rodadaCartola', true));
                let ultimaRodadaFaseGrupos = rodada[0].rodadaCartola + 1;
                const confrontoAberto = [];
                campeonatoAberto.grupos.forEach(grupo => {
                    grupo.confrontos.forEach(confronto => {
                        if (confronto.encerrado === false){
                            confrontoAberto.push(confronto);
                        };
                    });
                });
                
                // Se nao tem mais jogos na fase de grupos
                if (confrontoAberto.length === 0){
                    // Encerrar a fase de grupos
                    campeonatoAberto.faseGruposEncerrada = true;
                    let grupos = await campeonato.getClassificaoGrupos(campeonatoAberto);

                    campeonatoAberto.mataMata.participantes = grupos.classificados;
            
                    //gerarConfrontoMataMata
                    let confrontosMataMata = await campeonato.gerarConfrontoMataMata(campeonatoAberto.id, grupos.classificados, ultimaRodadaFaseGrupos, campeonatoAberto.jogoUnicoMataMata, campeonatoAberto.jogoUnicoFinal);
                    campeonatoAberto.mataMata.confrontos = confrontosMataMata;

                    campeonatoAberto.save();
                };
            };

            // Campeonato pontos corridos
            if (campeonatoAberto.tipoCopa === false && campeonatoAberto.encerrado === false ){
                const rodadaFim = campeonatoAberto.rodadaFinal || rodadaBase.rodadaAtual;
                const classificacaoAtual = campeonatoAberto.classificacao.slice();
                const classificacaoAtualizada = [];
                //console.log("Classificacao atual")
                //console.log(classificacaoAtual);

                for (let index = 0; index < campeonatoAberto.participantes.length; index++) {
                    const participante = campeonatoAberto.participantes[index];
                    const jogosComputados = campeonatoAberto.classificacao.filter(classificacao => classificacao.jogador.toString() === participante.toString());
                    const jogosComputar = [];
                    const rodadaInicioComputar = jogosComputados.totalJogos || 0;
                    for (let computarJogo = rodadaInicioComputar + 1; computarJogo <= rodadaFim; computarJogo++) {
                        const pontosRodada = await historico.buscarPontuacaoRodada(participante,computarJogo);
                        if(pontosRodada){
                            jogosComputar.push({jogador: participante, rodada: computarJogo, pontuacao: pontosRodada});
                        };
                    };
                    let totalPontosComputados = jogosComputados.totalPontos || 0;
                    let totalJogosComputados = jogosComputados.totalJogos || 0;
                    jogosComputar.forEach(jogo => {
                        totalPontosComputados = totalPontosComputados + jogo.pontuacao;
                        totalJogosComputados = totalJogosComputados + 1;
                    });
                    
                    classificacaoAtualizada.push({posicao: null, jogador: participante, totalPontos: totalPontosComputados, totalJogos:  totalJogosComputados});
                };

                classificacaoAtualizada.sort(funcoesArray.ordernar('totalPontos',true))
                for (let index = 0; index < classificacaoAtualizada.length; index++) {
                    const element = classificacaoAtualizada[index];
                    element.posicao = index + 1;
                };

                //console.log("Classificacao atualizada")
                //console.log(classificacaoAtualizada)
                campeonatoAberto.classificacao = classificacaoAtualizada;
                campeonatoAberto.save();
            };

            // Campeonato do tipo copa
            if(campeonatoAberto.tipoCopa === true && campeonatoAberto.faseGruposEncerrada === true){
                const confrontosMataMata = await confronto.confrontosFinalizados(campeonatoAberto.mataMata.confrontos);
                const classificacaoMataMata = [];
                
                // Se o numero de confrontos encerrados retornados é igual ao numero de confrontos do campeonato, o campeonato esta finalizado
                if (confrontosMataMata.length === campeonatoAberto.mataMata.confrontos.length) {
                    confrontosMataMata.sort(funcoesArray.ordernar('rodadaCartola', true)); 
                    const ultimaRodadaMataMata = confrontosMataMata[0].rodadaCartola;
                    const rodadaFinalMataMata = confrontosMataMata.filter(confronto => confronto.rodadaCartola === ultimaRodadaMataMata);
                    rodadaFinalMataMata.forEach(resultado => {
                        let classificacaoVencedor;
                        let classificacaoPerdedor;
                        if (resultado.linkMataMata.vencedores){
                            classificacaoVencedor = 1;
                            classificacaoPerdedor = 2;
                        } else {
                            classificacaoVencedor = 3;
                            classificacaoPerdedor = 4;
                        };
                        resultado.jogadores.sort(funcoesArray.ordernar('pontuacao', true));

                        let vencedor = resultado.jogadores[0];
                        let perdedor = resultado.jogadores[1];

                        classificacaoMataMata.push({posicao: classificacaoVencedor, jogador: vencedor.jogador});
                        classificacaoMataMata.push({posicao: classificacaoPerdedor, jogador: perdedor.jogador});                     
                    });
                };

                if (confrontosMataMata.length > 0){
                    campeonatoAberto.encerrado = true;
                    campeonatoAberto.classificacao = classificacaoMataMata;
                    campeonatoAberto.save();
                };

            };

        };

        //const campeonatosPontoCorrido = campeonatos.find(campeonato => campeonato.tipoCopa === false);
        //const campeonatosCopa = campeonatos.find(campeonato => campeonato.tipoCopa === true);

    };
    console.log(`Há ${campeonatos.length} campeonato em aberto`);

};

module.exports = { rodadaAtual }