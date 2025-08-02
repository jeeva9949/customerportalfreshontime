/*
 * server/models/payment.js
 */
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) { Payment.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' }); }
  }
  Payment.init({
    customer_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    due_date: DataTypes.DATE,
    paid_date: DataTypes.DATE
  }, { sequelize, modelName: 'Payment', tableName: 'payments' });
  return Payment;
};