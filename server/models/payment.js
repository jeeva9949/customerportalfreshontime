/*
 * server/models/payment.js
 * Defines the Payment model.
 */
'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // A Payment belongs to one Customer
      Payment.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
      });
    }
  }
  Payment.init({
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('Due', 'Paid', 'Overdue'), defaultValue: 'Due' },
    due_date: { type: DataTypes.DATE, allowNull: false },
    paid_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  });
  return Payment;
};
