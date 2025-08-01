/*
 * server/models/delivery.js (UPDATED)
 * This model now correctly links to the Agent model instead of the User model.
 */
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Delivery extends Model {
    static associate(models) {
      Delivery.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
      Delivery.belongsTo(models.Agent, { foreignKey: 'agent_id', as: 'agent' }); // <-- THIS IS THE FIX
    }
  }
  Delivery.init({
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    agent_id: { type: DataTypes.INTEGER },
    delivery_date: { type: DataTypes.DATE, allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'In Transit', 'Delivered', 'Cancelled'), defaultValue: 'Pending' },
    item: { type: DataTypes.STRING }
  }, { sequelize, modelName: 'Delivery', tableName: 'deliveries' });
  return Delivery;
};