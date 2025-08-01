/*
 * In the file named '...add-fields-to-customers.js'
 */
'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'email', {
      type: Sequelize.STRING,
      allowNull: true, // Or false if you want it to be required
      validate: {
        isEmail: true
      }
    });
    await queryInterface.addColumn('customers', 'first_purchase_date', {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'email');
    await queryInterface.removeColumn('customers', 'first_purchase_date');
  }
};