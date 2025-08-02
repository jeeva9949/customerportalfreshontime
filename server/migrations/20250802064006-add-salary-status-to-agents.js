'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('agents', 'salary_status', {
      type: Sequelize.ENUM('Paid', 'Unpaid'),
      defaultValue: 'Unpaid'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('agents', 'salary_status');
  }
};