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
    rodadaFinal: {
        type: Number,
        required: [true, 'Por favor informe a rodada final deste campeonato']
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
    ],
    tipoCopa: {
        type: Boolean,
        default: false
    },
    qtdGrupos: {
        type: Number
    },
    sorteioRealizado: {
        type: Boolean,
        default: false
    },
    encerrado: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Campeonato',CampeonatoSchema);