module.exports = (sequelize, DataTypes) => {
    const Favorito = sequelize.define('Favorito', {
      // Colunas do modelo Favorito, se houver
    }, {});
  
    Favorito.associate = (models) => {
      Favorito.belongsTo(models.Usuario);
      Favorito.belongsTo(models.Topico);
    };
  
    return Favorito;
  };