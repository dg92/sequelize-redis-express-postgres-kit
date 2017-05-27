'use strict';
module.exports = function(sequelize, DataTypes) {
  const Teams = sequelize.define('Teams', {
    name: DataTypes.STRING,
    user_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Teams.belongsTo(models.Users, {foreignKey: 'user_id'});
      }
    }
  });
  return Teams;
};