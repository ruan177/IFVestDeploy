const { Router } = require('express');
const { Usuario } = require('../../../models');

exports.PagePerfilUsuarioController = async (req, res) => {
  const id = req.session.idUsuario;
  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      throw new Error("Usuario não encontrado")
    }
    res.status(200).render('usuario/perfil_usuario', { usuario });
  } catch (err) {
    console.error(err)
    res.redirect('/perfil');
  }
}