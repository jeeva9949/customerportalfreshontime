/*
 * server/migrations/2025080205-create-payments.js (NEW FILE)
 */
'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2) },
      status: { type: Sequelize.STRING },
      due_date: { type: Sequelize.DATE },
      paid_date: { type: Sequelize.DATE },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) { await queryInterface.dropTable('payments'); }
};