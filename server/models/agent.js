/*
 * server/models/agent.js (UPDATED)
 */
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    validPassword(password) { return bcrypt.compareSync(password, this.password); }
    static associate(models) { Agent.hasMany(models.Delivery, { foreignKey: 'agent_id' }); }
  }
  Agent.init({
    name: DataTypes.STRING, email: DataTypes.STRING, password: DataTypes.STRING,
    mobile: DataTypes.STRING, join_date: DataTypes.DATE, bank_details: DataTypes.TEXT
  }, { sequelize, modelName: 'Agent', tableName: 'agents', hooks: { beforeCreate: (agent) => { if (agent.password) { agent.password = bcrypt.hashSync(agent.password, 10); } } } });
  return Agent;
};