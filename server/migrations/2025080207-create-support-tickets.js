    // File: server/migrations/YYYYMMDDHHMMSS-create-support-tickets.js
    'use strict';
    module.exports = {
      async up(queryInterface, Sequelize) {
        await queryInterface.createTable('support_tickets', {
          id: { 
            allowNull: false, 
            autoIncrement: true, 
            primaryKey: true, 
            type: Sequelize.INTEGER 
          },
          agent_id: { 
            type: Sequelize.INTEGER, 
            allowNull: false, 
            references: { model: 'agents', key: 'id' }, 
            onDelete: 'CASCADE' 
          },
          issueType: { 
            type: Sequelize.STRING, 
            allowNull: false 
          },
          details: { 
            type: Sequelize.TEXT 
          },
          status: { 
            type: Sequelize.ENUM('Open', 'Resolved'), // UPDATED LINE
            defaultValue: 'Open' 
          },
          createdAt: { 
            allowNull: false, 
            type: Sequelize.DATE 
          },
          updatedAt: { 
            allowNull: false, 
            type: Sequelize.DATE 
          }
        });
      },
      async down(queryInterface, Sequelize) { 
        await queryInterface.dropTable('support_tickets'); 
      }
    };
    