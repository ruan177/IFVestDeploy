const { Router } = require('express');

exports.PageCriarSimuladoController = async (req, res) => {
    let errorMessage = req.session.errorMessage;
    if (errorMessage === null) {
        errorMessage = " ";
    }

    req.session.errorMessage = null;

    res.render('simulado/criar-simulado', { errorMessage });
};
