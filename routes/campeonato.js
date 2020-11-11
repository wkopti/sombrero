const express = require('express');
const { 
    createCampeonato,
    deleteCampeonato,
    getCampeonato,
    getCampeonatos,
    updateCampeonato,
    sortearCampeonato,
    confrontosCampeonato
} = require('../controllers/campeonato');

const Campeonato = require('../models/Campeonato');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(Campeonato,{ 
                                    path:'participantes',
                                    select: 'timeCartola nome -_id'
                                  }),getCampeonatos)
  .post(createCampeonato);

router
  .route('/sortear/:id')
  .get(sortearCampeonato);

router
  .route('/confrontos/:id')
  .get(confrontosCampeonato);

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