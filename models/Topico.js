module.exports = (sequelize, DataTypes) => {
  const Topico = sequelize.define('Topico', {
    materia: DataTypes.STRING,
    areaId: DataTypes.INTEGER,
  }, {
    tableName: 'topicos'
  });

  Topico.associate = (models) => {
    Topico.belongsTo(models.Area,  
      {foreignKey: 'areaId'},);
    Topico.hasMany(models.Favorito)
    Topico.hasMany(models.Questões);
  };

  Topico.associate = (models)=>{
    Topico.hasMany(models.Video);
}

  return Topico;
};