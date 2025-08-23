'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // An Order belongs to a Customer and has many OrderItems
      Order.belongsTo(models.Customer, { foreignKey: 'customerId' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId' });
    }
  }
  Order.init({
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers', // Matches your existing table name
        key: 'id'
      }
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'),
      defaultValue: 'Pending'
    },
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};
