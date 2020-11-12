const express = require('express');
const { 
    updateConfronto,
    createConfronto,
    getConfronto
} = require('../controllers/confronto');

const Confronto = require('../models/Confronto');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

router
  .route('/:id')
    .put(updateConfronto)
    .get(getConfronto);

router
    .route('/')
      .post(createConfronto);

module.exports = router;