import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('Feed', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    },
    domain: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'feeds',
    timestamps: false
  });
}
