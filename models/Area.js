module.exports = (sequelize, DataTypes) => {
    const Area = sequelize.define('Area', {
      area: DataTypes.STRING,
      descricao: DataTypes.STRING,
    }, {});
    
    Area.associate = (models)=>{
      Area.hasMany(models.Simulados);
  }
    return Area;
  };