/*
 * server/migrations/2025080204-create-deliveries.js (NEW FILE)
 */
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      agent_id: { type: Sequelize.INTEGER, references: { model: 'agents', key: 'id' }, onDelete: 'SET NULL' },
      delivery_date: { type: Sequelize.DATE },
      status: { type: Sequelize.STRING },
      item: { type: Sequelize.STRING },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('deliveries'); }
};