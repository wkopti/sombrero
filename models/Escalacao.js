const mongoose = require('mongoose');

const EscalacaoSchema = new mongoose.Schema({
    idChicano:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chicano',
        required: [true, 'Informe o id do Chicano']
    },
    retornoCartola: {}
});

module.exports = mongoose.model('Escalacao',EscalacaoSchema);