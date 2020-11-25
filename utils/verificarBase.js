const rodada = require('../controllers/rodada');
const confronto = require('../controllers/confronto');
const campeonato = require('../controllers/campeonato');
const historico = require('../controllers/historico'); 
const funcoesArray = require('./funcoesArray');
const pontuacao = require('../controllers/pontuacao');
const escalacao = require('../controllers/escalacao');

async function atualizarConfronto(confrontoAtual) {
    const atualizado = await confronto.obterResultadoConfronto(confrontoAtual);
    return atualizado;
};

const rodadaAtual = async() => {
    let rodadaBase = await rodada.retornarRodada();
    const dataAtual = new Date;
    let rodadaAndamento;
    let rodadas = [];
    let ts = new Date().getTime()/1000;

    rodadaBase.rodadas.forEach(element => {
        rodadas.push(element);
    });

    //const rodadaAtualData = rodadas.find(r => dataAtual.getTime() <= r.inicio.getTime()) ;
    //const rodadaAtualData = rodadas.find(r => dataAtual.getTime() >= r.inicio.getTime() && dataAtual.getTime() <= r.fim.getTime());

    console.log('Data atual =>',dataAtual);
    console.log('Timestamp da data atual =>',dataAtual.getTime());
    console.log('Quantas rodadas =>',rodadas.length);
    //console.log('Rodada encontrada (com base na data atual) => '+ rodadaAtualData.rodada_id);
    //console.log('Timestamp do inicio da rodada encontrada (com base na data atual) => '+ rodadaAtualData.inicio.getTime());
    console.log('Rodada atual carregada no banco =>',rodadaBase.rodadaAtual);
    
    let retornoRodadaBase = await rodada.retornarRodada();
    let rodadaCarregada = retornoRodadaBase.rodadas.find(rodada => rodada.rodada_id === retornoRodadaBase.rodadaAtual);
    let rodadaAtual;
    let mercadoAberto = true;

    let msg = "Validando rodada carregada =>";

    if(ts >= rodadaCarregada.fim.getTime()){
        console.log(msg, "Rodada atual encerrada, carregar nova rodada");
        retornoRodadaBase = await rodada.recarregarRodada();
        await escalacao.apagarEscalacao();
    } else {
        console.log(msg, "Rodada em andamento");
        if(ts < retornoRodadaBase.fechamento.timestamp) {
            mercadoAberto = true;
        } else {
            mercadoAberto = false;
        };
        console.log("Mercado aberto",mercadoAberto);
    };

    // Definimos a rodada atual
    rodadaAtual = retornoRodadaBase.rodadaAtual;

    // Se o mercado fechou => Mudei para true só para teste mas é false !mercadoAberto
    if(mercadoAberto){

        // Carregamos a escalacao feita por todos os jogadores da base
        await escalacao.carregarEscalacao();

        // Horario em comum das partidas validas para o cartola
        const partidasValidas = await rodada.retornarPartidasValidas();
        const horarioPartidas = partidasValidas.map(partida => partida.partida_data)
                                               .filter((v, i, a) => a.indexOf(v) === i)
                                               .sort();
        console.log(horarioPartidas);
        
    };

    // Campeonatos nao encerrados
    const campeonatos = await campeonato.getCampeonatosEmAberto();
    console.log(`Há ${campeonatos.length} campeonato em aberto`);
    if (campeonatos.length > 0){

        for (let index = 0; index < campeonatos.length; index++) {
            const campeonatoAberto = campeonatos[index];
            
            // Campeonato pontos corridos
            if (!campeonatoAberto.tipoCopa){
                let atualizarClassificacaoCampeonato = false;
                const classificacaoAtual = campeonatoAberto.classificacao.slice();
                const participantes = campeonatoAberto.participantes.slice();
                const pontuacaoParticipantes = [];

                // Atualizacao da pontuacao para cada participante do campeonato
                for (let index = 0; index < participantes.length; index++) {
                    let atualizarPontuacaoParticipante = false;
                    const participante = participantes[index];
                    const jogosComputados = classificacaoAtual.filter(classificacao => classificacao.jogador.toString() === participante.toString());
                    const jogosComputar = [];
                    const rodadaInicioComputar = jogosComputados[0].totalJogos + 1 || campeonatoAberto.rodadaInicio;
                    const rodadaFimComputar = campeonatoAberto.rodadaFinal || rodadaAtual;
                    
                    // Se a rodada que devemos computar é menor que a rodada final parametrizada no campeonato (se nao tiver, pegamos a rodada atual)
                    if(rodadaInicioComputar <= rodadaFimComputar){
                        for (let computarJogo = rodadaInicioComputar; computarJogo < rodadaFimComputar; computarJogo++) {
                            atualizarPontuacaoParticipante = true;
                            const pontosRodada = await historico.buscarPontuacaoRodada(participante,computarJogo);
                            if(pontosRodada){
                                jogosComputar.push({jogador: participante, rodada: computarJogo, pontuacao: pontosRodada});
                            };
                        };
                    };

                    // Contabilizar a pontuacao do participante das rodadas encontradas
                    if (atualizarPontuacaoParticipante){
                        let totalPontosComputados = jogosComputados.totalPontos || 0;
                        let totalJogosComputados = jogosComputados.totalJogos || 0;
                        jogosComputar.forEach(jogo => {
                            totalPontosComputados = totalPontosComputados + jogo.pontuacao;
                            totalJogosComputados = totalJogosComputados + 1;
                        });
                        atualizarClassificacaoCampeonato = true;
                        pontuacaoParticipantes.push({posicao: null, jogador: participante, totalPontos: totalPontosComputados, totalJogos:  totalJogosComputados});
                    };
                    
                };

                // Se algum participante teve nova pontuacao computada
                if (atualizarClassificacaoCampeonato) {

                    // Para cada nova pontuacao do participante computada devemos pegar o historico + o atual
                    pontuacaoParticipantes.forEach(pontuacaoParticipante => {
                        const idxPontuacaoAtual = classificacaoAtual.findIndex(classificacao => classificacao.jogador.toString() === pontuacaoParticipante.jogador.toString());
                        if (idxPontuacaoAtual > -1){
                            const pontuacaoAtualParticipante = classificacaoAtual.splice(idxPontuacaoAtual,1);
                            pontuacaoParticipante.totalPontos = pontuacaoAtualParticipante[0].totalPontos + pontuacaoParticipante.totalPontos;
                            pontuacaoParticipante.totalJogos = pontuacaoAtualParticipante[0].totalJogos + pontuacaoParticipante.totalJogos;
                        };
                        classificacaoAtual.push(pontuacaoParticipante);
                    });

                    // Ordenar pelo totalPontos e refazer a classificacao
                    classificacaoAtual.sort(funcoesArray.ordernar('totalPontos',true));
                    for (let index = 0; index < classificacaoAtual.length; index++) {
                        const classificacaoParticipante = classificacaoAtual[index];
                        classificacaoParticipante.posicao = index + 1;
                    };

                    // Jogar a nova classificao no campeonato e salvar
                    campeonatoAberto.classificacao = classificacaoAtual;
                    await campeonatoAberto.save();

                };

                // Se nao precisamos mais atualizar a classificacao e a rodada fim do campeonato chegou, terminamos o campeonato
                if(!atualizarClassificacaoCampeonato && campeonatoAberto.rodadaFinal < rodadaAtual){
                    console.log("Campeonato Encerrado =>",campeonatoAberto.nome);
                    campeonatoAberto.encerrado = true;
                    await campeonatoAberto.save();
                };

            };

            // Campeonato do tipo copa
            if(campeonatoAberto.tipoCopa){

                // Atualizacao da fase de grupos
                if(campeonatoAberto.faseGruposEncerrada === false){
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
    
                        await campeonatoAberto.save();
                    };

                } else { 
                    // Atualizacao da fase de Mata Mata
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
                        await campeonatoAberto.save();
                        // dispara job de campeao?
                    };
                };
            };
        };
    };

    // Confrontos
    const confrontos = await confronto.getConfrontosEmAberto(rodadaAtual);
    confrontos.sort(funcoesArray.ordernar('rodadaCartola', false));

    if (confrontos.length > 0) {
        console.log(`Há ${confrontos.length} confrontos que precisam ser atualizados` );
        for (var i = 0; i < confrontos.length; i++){
            console.log(`Atualizar o confronto => ${confrontos[i]._id}`);
            confrontos[i] = await atualizarConfronto(confrontos[i]);
        };
    };

};

module.exports = { rodadaAtual }