import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Tag', {
    tag_name: {
      type: DataTypes.STRING(100),
      primaryKey: true
    }
  }, {
    tableName: 'tags',
    timestamps: false
  });
}
