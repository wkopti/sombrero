const express = require('express');
const { 
    pontuacaoChicano
} = require('../controllers/pontuacao');

const router = express.Router();

router
  .route('/:id')
  .get(pontuacaoChicano);

  module.exports = router;