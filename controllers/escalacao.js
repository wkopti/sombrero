const ErrorResponse = require('../utils/errorResponse');
const Escalacao = require('../models/Escalacao');
const chicano = require('../controllers/chicano');
const cartola = require('../utils/cartola');

exports.apagarEscalacao = async() => {
    const chicanos = await chicano.buscarChicanos();
    const arrChicanos = [];
    chicanos.forEach(chicano => {
        arrChicanos.push(chicano.id);
    });
    await Escalacao.deleteMany({"idChicano": { $in: arrChicanos }});
};

exports.carregarEscalacao = async() => {
    const chicanos = await chicano.buscarChicanos();
    for (let index = 0; index < chicanos.length; index++) {
        const chicano = chicanos[index];
        let escalacaoChicano = await Escalacao.find({ idChicano : chicano.id });
        if(escalacaoChicano.length == 0){
            let escalacaoCartola = await cartola(process.env.CARTOLA_TIME+"/"+chicano.idTime);
            await Escalacao.create({ idChicano: chicano.id, retornoCartola: escalacaoCartola});
        };
    };
};

exports.retornarEscaladao = async(idChicano) => {
    let escalacaoChicano = await Escalacao.find({ idChicano : idChicano });
    return escalacaoChicano;
};