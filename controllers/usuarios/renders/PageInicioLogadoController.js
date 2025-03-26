const { Router } = require('express');
const { Usuario } = require('../../../models');


exports.PageInicioLogadoController = async (req, res) => {
    const id = req.session.idUsuario;
    try {
      const usuario = await Usuario.findByPk(id);
  
      if (!usuario) {
        throw new Error("Usuario não encontrado")
      }
      res.status(200).render('usuario/inicio-logado');
    } catch (err) {
      console.error(err)
      req.session.destroy();
      res.redirect('/login');
    }
  };