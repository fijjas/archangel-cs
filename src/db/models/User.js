import { DataTypes } from 'sequelize';

export default function(sequelize) {
  return sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    telegram_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },
    language: {
      type: DataTypes.STRING(2),
      defaultValue: 'en'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false
  });
}
