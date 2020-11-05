const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const logger = require('./middleware/logger');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

// Conexao com o banco 
connectDB();

// Arquivos de rota
const chicano = require('./routes/chicano');
const campeonato = require('./routes/campeonato');

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'dev') {
    app.use(morgan('dev'));
}

//app.use(logger);

// Rotas
app.use('/api/v1/chicano', chicano);
app.use('/api/v1/campeonato', campeonato);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT, 
    console.log(`Rodando em ${process.env.NODE_ENV} na porta ${PORT}`)
);

// Handle erros

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error:${err.message} `);
    server.close(() => process.exit(1));
})