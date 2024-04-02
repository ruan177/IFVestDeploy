module.exports = (sequelize, DataTypes) => {
    const Area = sequelize.define('Area', {
      area: DataTypes.STRING,
      descricao: DataTypes.STRING,
    }, {
      tableName: 'areas'
    });
    
    Area.associate = (models)=>{
      Area.hasMany(models.Simulados, {
        foreignKey: 'areaId', // Specify the correct foreign key name here
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
     });
  }
    return Area;
  };