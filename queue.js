const dotenv = require('dotenv');
const connectDB = require('./config/db');
const verificarBaseQueue = require('./queues/verificarBaseQueue');

// Variaveis de ambiente
dotenv.config({ path: './config/config.env'});

// Conexao com o banco 
connectDB();

verificarBaseQueue.processarFila();