// ====================================================
// --- File: server/models/supportTicket.js ---
// ====================================================
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SupportTicket extends Model {
    static associate(models) {
      SupportTicket.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
    }
  }
  SupportTicket.init({
    agent_id: { type: DataTypes.INTEGER, allowNull: false },
    issueType: { type: DataTypes.STRING, allowNull: false },
    details: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('Open', 'Closed'), defaultValue: 'Open' }
  }, { sequelize, modelName: 'SupportTicket', tableName: 'support_tickets' });
  return SupportTicket;
};