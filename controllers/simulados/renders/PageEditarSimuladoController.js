
const { Simulados } = require('../../../models');

exports.PageEditarSimuladoController = async (req, res) => {
    const simuladoId = req.params.id
    try {
      const simulado = await Simulados.findOne({
        where: { id: simuladoId },
      });
  
      if (!simulado) {
        throw new Error('Simulado não encontrado ');
      }
      let errorMessage = req.session.errorMessage;
  
      if (errorMessage === null) {
        errorMessage = " ";
      }
      req.session.errorMessage = null;
  
      res.render('simulado/editar-simulado', { simulado, errorMessage });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }