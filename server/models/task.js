export default function(sequelize, DataTypes) {
    const Task = sequelize.define('Task', {
            text: DataTypes.STRING,
            taskListId: DataTypes.INTEGER
        }, {
            classMethods: {
            associate: models => {
                Task.belongsTo(models.TaskList);
            }
        }
    });
    return Task;
};
