'use strict';
module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('Users', {
    email: DataTypes.STRING,
    hashed_password: DataTypes.TEXT,
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        // Users.belongsTo(models.Teams);
      }
    }
  });
  return Users;
};