const { Topico } = require('../../../models');

exports.PageMeusTopicosController = async (req, res) => {
    const usuarioId = req.session.idUsuario;
    const limit = 10; // Número de questões por página
    const { materia } = req.query;
    const page = parseInt(req.query.page) || 1; // Página atual, padrão é 1
    const offset = (page - 1) * limit;
    let topicos;
    try {
  
      // Dentro do bloco try da rota '/questoes'
      const topicosCount = await Topico.count({
        where: {
          usuarioId: usuarioId,
        },
      });
  
      const totalPages = Math.ceil(topicosCount / limit);
  
      const topicosSemFiltro = await Topico.findAll({
        where: {
          usuarioId: usuarioId,
        },
        limit: limit,
        offset: offset,
      });
  
      if (materia) {
        topicos = topicosSemFiltro.filter(topico => topico.materia.toLowerCase().includes(materia.toLowerCase()));
        console.log(topicos)
      } else {
        topicos = topicosSemFiltro
      }
      let errorMessage = req.session.errorMessage;
  
      if (errorMessage === null) {
        errorMessage = " ";
      }
  
      req.session.errorMessage = null;
      res.status(200).render('professor/meus-topicos', { topicos, totalPages, page, errorMessage });
  
    } catch (err) {
      req.sesssion.destroy();
      res.status(500).redirect('/usuario/inicioLogado');
    };
  
  }