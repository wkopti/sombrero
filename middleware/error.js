const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log no console
    console.log(err.stack);

    // Mongoose - identificacao invalida
    if (err.name === 'CastError') {
        const message = `O recurso nao foi encontrado`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose - erro validacao de campos
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    // Mongoose - erro chaves duplicadas
    if (err.code === 11000) {
        const message = `Registro ja existe`;
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server error'
    });
};

module.exports = errorHandler;