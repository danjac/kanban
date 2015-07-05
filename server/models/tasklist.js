export default function(sequelize, DataTypes) {

    const TaskList = sequelize.define('TaskList', {
        name: DataTypes.STRING,
        ordering: DataTypes.INTEGER,
        }, {
            classMethods: {
                associate: models => {
                    TaskList.hasMany(models.Task, {onDelete: 'cascade'});
                }

            }
    });

    TaskList.hook('beforeCreate', (list, options, fn) => {
        return TaskList.max('ordering')
        .then(value => {
            list.ordering = (value || 0) + 1;
            fn(null, list);
        });
    });

    return TaskList;

};
