'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
    return queryInterface
    .createTable('TaskList', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        }
      })
    .then(function() {
    return queryInterface
    .createTable('Task', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        createdAt: {
            type: Sequelize.DATE
        },
        updatedAt: {
            type: Sequelize.DATE
        },
        text: {
            type: Sequelize.STRING,
            allowNulls: false
        },
        taskList: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'TaskList',
                key: 'id'
            }
        }
      })


    });

  },

  down: function (queryInterface, Sequelize) {
      queryInterface.dropAllTables();
  }
};
