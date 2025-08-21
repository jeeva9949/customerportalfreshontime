    'use strict';

    module.exports = {
      async up (queryInterface, Sequelize) {
        await queryInterface.addColumn('deliveries', 'is_recurring', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      },

      async down (queryInterface, Sequelize) {
        await queryInterface.removeColumn('deliveries', 'is_recurring');
      }
    };
    