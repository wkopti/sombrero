const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    // Copiar os parametros passados
    const reqQuery = { ...req.query };

    // Campos a serem retirados
    const camposRemovidos = ['select', 'sort', 'page', 'limit'];

    // Loop nos campos
    camposRemovidos.forEach(param => delete reqQuery[param]);

    // Criar a query
    let queryStr = JSON.stringify(reqQuery);

    // Criar os operadores
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Realizar a busca
    query = model.find(JSON.parse(queryStr));

    // Filtros
    if (req.query.select){
        const campos = req.query.select.split(',').join(' ');
        query = query.select(campos);
    };

    // Ordenacao
    if (req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    };

    // Paginacao
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 1000;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate);
    }

    // Executa a query
    const results = await query;

    // Resultado paginacao
    const pagination = {};

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    };

    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    };

    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    };

    next();

};

module.exports = advancedResults;