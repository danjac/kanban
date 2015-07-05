'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
    return queryInterface
    .createTable('TaskLists', {
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
        },
        ordering: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
      })
    .then(function() {
    return queryInterface
    .createTable('Tasks', {
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
        taskListId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'TaskLists',
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
