import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('News', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    feed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'feeds',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT
    },
    description: {
      type: DataTypes.TEXT
    },
    published_at: {
      type: DataTypes.DATE
    },
    cve_code: {
      type: DataTypes.STRING(50)
    },
    is_analyzed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'news',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['feed_id', 'url']
      }
    ]
  });
}
