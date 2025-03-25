const { Usuario } = require('../../../models');
const { Router } = require('express');

exports.PageSobreNosController = async (req, res) => {
    res.status(200).render('desenvolvedores/sobreNos');
}