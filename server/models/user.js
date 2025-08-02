// ====================================================
// --- File: server/models/user.js ---
// ====================================================
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    validPassword(password) { return bcrypt.compareSync(password, this.password); }
    static associate(models) {}
  }
  User.init({
    name: DataTypes.STRING, 
    email: DataTypes.STRING, 
    password: DataTypes.STRING, 
    role: DataTypes.STRING
  }, { 
    sequelize, 
    modelName: 'User', 
    tableName: 'users', 
    hooks: { 
      beforeCreate: (user) => { user.password = bcrypt.hashSync(user.password, 10); } 
    } 
  });
  return User;
};

