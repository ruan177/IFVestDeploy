

const { Simulados } = require('../../models');


exports.RegistrarSimuladoController = async (req, res) => {
    const { titulo, descricao, tipo } = req.body;
    const usuarioId = req.session.idUsuario;
    const tipoformatado = tipo.toUpperCase()
  
    if (!titulo || !descricao || !tipo) {
      throw new Error("Dados Invalidos !!! ")
    }
  
    try {
      const simulado = await Simulados.create({
        titulo,
        descricao,
        usuarioId: usuarioId,
        tipo: tipoformatado
      });
  
      if (!simulado) {
        throw new Error("Simulado não criado!!! ")
      }
  
      res.redirect(`/simulados/${simulado.id}/adicionar-questoes`);
    } catch (err) {
      console.error(err);
      req.session.errorMessage = err.message;
      res.redirect('back')
    }
  }