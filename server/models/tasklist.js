export default function(sequelize, DataTypes) {

    const TaskList = sequelize.define('TaskList', {
        name: DataTypes.STRING,
        ordering: DataTypes.INTEGER,
        }, {
            classMethods: {
                associate: models => {
                    TaskList.hasMany(models.Task);
                }
        }
    });

    return TaskList;

};
