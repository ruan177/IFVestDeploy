const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Resposta extends Model {
    static associate(models) {
      this.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
      this.belongsTo(models.Simulados, { foreignKey: 'provaId', as: 'prova' });
    }
  }

  Resposta.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    resposta: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    provaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Resposta',
    tableName: 'resposta'
  });

  return Resposta;
};
