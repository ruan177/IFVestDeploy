module.exports = (sequelize, DataTypes) => {
    const Questões = sequelize.define('Questões', {
      pergunta: DataTypes.TEXT,
      titulo: DataTypes.TEXT,
      resposta: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {});
  
    Questões.associate = (models) => {
      Questões.belongsTo(models.Topico, { foreignKey: 'topicoId' });
      Questões.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
      Questões.belongsToMany(models.Simulados, { through: 'perguntas_provas', foreignKey: 'QuestõesId' });
    };     
    return Questões;
  };
  