/*
 * In the file named '...add-fields-to-users.js'
 */
'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    // Note: 'users' table is used for both Admins and Agents
    await queryInterface.addColumn('users', 'mobile', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'joined_date', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
    await queryInterface.addColumn('users', 'salary_status', {
      type: Sequelize.ENUM('Paid', 'Unpaid'),
      defaultValue: 'Unpaid'
    });
    await queryInterface.addColumn('users', 'bank_details', {
      type: Sequelize.TEXT, // To store multi-line bank info
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'mobile');
    await queryInterface.removeColumn('users', 'joined_date');
    await queryInterface.removeColumn('users', 'salary_status');
    await queryInterface.removeColumn('users', 'bank_details');
  }
};