// ====================================================
// --- File: server/models/passwordRequest.js (NEW) ---
// ====================================================
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PasswordRequest extends Model {
    static associate(models) {
      PasswordRequest.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
    }
  }
  PasswordRequest.init({
    agent_id: { type: DataTypes.INTEGER, allowNull: false },
    new_password: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Approved'), defaultValue: 'Pending' }
  }, { sequelize, modelName: 'PasswordRequest', tableName: 'password_requests' });
  return PasswordRequest;
};

