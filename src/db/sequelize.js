import { Sequelize } from 'sequelize';
import UserModel from './models/User.js';
import FeedModel from './models/Feed.js';
import NewsModel from './models/News.js';
import TagModel from './models/Tag.js';
import UserTagModel from './models/UserTag.js';
import NewsTagModel from './models/NewsTag.js';
import NotificationModel from './models/Notification.js';

var sequelize = new Sequelize(
  process.env.POSTGRES_DB || 'archangelcs',
  process.env.POSTGRES_USER || 'archangel',
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

var models = {};

function initModels() {
  models.User = UserModel(sequelize);
  models.Feed = FeedModel(sequelize);
  models.News = NewsModel(sequelize);
  models.Tag = TagModel(sequelize);
  models.UserTag = UserTagModel(sequelize);
  models.NewsTag = NewsTagModel(sequelize);
  models.Notification = NotificationModel(sequelize);

  models.User.belongsToMany(models.Tag, { through: models.UserTag, foreignKey: 'user_id' });
  models.Tag.belongsToMany(models.User, { through: models.UserTag, foreignKey: 'tag_name' });

  models.News.belongsToMany(models.Tag, { through: models.NewsTag, foreignKey: 'news_id' });
  models.Tag.belongsToMany(models.News, { through: models.NewsTag, foreignKey: 'tag_name' });

  models.News.belongsTo(models.Feed, { foreignKey: 'feed_id' });
  models.Feed.hasMany(models.News, { foreignKey: 'feed_id' });

  models.Notification.belongsTo(models.User, { foreignKey: 'user_id' });
  models.User.hasMany(models.Notification, { foreignKey: 'user_id' });
}

export { sequelize, models, initModels };
