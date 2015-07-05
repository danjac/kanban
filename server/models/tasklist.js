export default function(sequelize, DataTypes) {

    const TaskList = sequelize.define('TaskList', {
        name: DataTypes.STRING,
        ordering: DataTypes.INT
        }, {
            classMethods: {
                associate: models => {
                // associations can be defined here
                }
        }
    });

    return TaskList;

};
