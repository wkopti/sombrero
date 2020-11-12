const express = require('express');
const { 
    createCampeonato,
    deleteCampeonato,
    getCampeonato,
    getCampeonatos,
    updateCampeonato,
    sortearCampeonato,
    confrontosCampeonato,
    classificacaoCampeonato
} = require('../controllers/campeonato');

const Campeonato = require('../models/Campeonato');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(Campeonato,{ 
                                    path:'participantes',
                                    select: 'timeCartola nome'
                                  }),getCampeonatos)
  .post(createCampeonato);

router
  .route('/sortear/:id')
  .get(sortearCampeonato);

router
  .route('/confrontos/:id')
  .get(confrontosCampeonato);

router
  .route('/classificacao/:id')
  .get(classificacaoCampeonato);

router
  .route('/:id')
  .get(advancedResults(Campeonato,{ 
                                    path:'participantes',
                                    select: 'nome'
                                  }),getCampeonato)
  //.get(getCampeonato)
  .put(updateCampeonato)
  .delete(deleteCampeonato);

module.exports = router;