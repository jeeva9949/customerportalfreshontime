// ====================================================
// --- File: server/models/delivery.js ---
// ====================================================
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate(models) {
      Delivery.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      Delivery.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' });
    }
  }
  Delivery.init({
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    agent_id: DataTypes.INTEGER,
    delivery_date: DataTypes.DATE,
    status: DataTypes.STRING,
    item: DataTypes.STRING
  }, { sequelize, modelName: 'Delivery', tableName: 'deliveries' });
  return Delivery;
};