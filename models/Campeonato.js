const mongoose = require('mongoose');

const CampeonatoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Por favor informe o nome do campeonato'],
        trim: true,
        unique: true,
        maxlength: [100, 'O nome nao pode ter mais do que 100 caracteres']
    },
    rodadaInicio: {
        type: Number,
        required: [true, 'Por favor informe a rodada inicial deste campeonato']
    },
    criadoEm: {
        type: Date,
        default: Date.now
    },
    participantes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chicano'
        }
    ]
});

module.exports = mongoose.model('Campeonato',CampeonatoSchema);