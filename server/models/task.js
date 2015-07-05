export default function(sequelize, DataTypes) {
    const Task = sequelize.define('Task', {
            text: DataTypes.STRING
        }, {
            classMethods: {
            associate: models => {
                Task.belongsTo(models.TaskList);
            }
        }
    });
    return Task;
};
