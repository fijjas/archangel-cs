import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('NewsTag', {
    news_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'news',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    tag_name: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      references: {
        model: 'tags',
        key: 'tag_name'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'news_tags',
    timestamps: false
  });
}
