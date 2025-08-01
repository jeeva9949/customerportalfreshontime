/*
 * server/models/user.js
 * Defines the User model (for Admins and Agents).
 */
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    validPassword(password) {
      return bcrypt.compareSync(password, this.password);
    }
    static associate(models) {
      // An Agent (User) has many Deliveries
      User.hasMany(models.Delivery, {
        foreignKey: 'agent_id',
        as: 'deliveries',
      });
    }
  }
  User.init({
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Delivery Agent'), allowNull: false }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync(10);
        user.password = bcrypt.hashSync(user.password, salt);
      }
    }
  });
  return User;
};