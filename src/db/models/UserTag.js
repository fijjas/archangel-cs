import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('UserTag', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'users',
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
    tableName: 'users_tags',
    timestamps: false
  });
}
