/*
 * server/models/agent.js (NEW FILE)
 * This is the model for your new, separate 'agents' table.
 */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    static associate(models) {
      // An Agent can be assigned to many Deliveries
      // Note: This assumes you will add an 'agent_id' to your Delivery model
      // and link it here. For now, we keep it simple.
    }
  }
  Agent.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    mobile: {
      type: DataTypes.STRING,
      allowNull: true
    },
    join_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    bank_details: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Agent',
    tableName: 'agents',
  });
  return Agent;
};