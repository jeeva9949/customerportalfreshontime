'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // An OrderItem belongs to an Order and a Product
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId' });
    }
  }
  OrderItem.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2), // Price at the time of purchase
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};
