import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';

const env = process.env.NODE_ENV || 'development',
      db = {},
      config = require(__dirname + '/../config/sequelize.json')[env],
      sequelize = new Sequelize(config.database,
                                config.username,
                                config.password,
                                config),
      basename = path.basename(module.filename);

fs
.readdirSync(__dirname)
.filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename);
})
.forEach(file => {
    const model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
});

  Object.keys(db).forEach(modelName => {
      if ('associate' in db[modelName]) {
        db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
