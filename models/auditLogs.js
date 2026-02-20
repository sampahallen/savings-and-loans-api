const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");
const User = require("./users");

const AuditLog = sequelize.define(
  "AuditLog",
  {
    auditId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      field: "audit_id",
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "performed_by",
      references: {
        model: User,
        key: "userId",
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "entity_type",
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "entity_id",
    },
    oldValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "old_values",
    },
    newValues: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: "new_values",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: "ip_address",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent",
    },
  },
  {
    tableName: "audit_logs",
    timestamps: true,
    underscored: true,
    updatedAt: false, // Audit logs should not have updated_at
  }
);

// Associations
AuditLog.belongsTo(User, {
  foreignKey: "performedBy",
  as: "performer",
});

User.hasMany(AuditLog, {
  foreignKey: "performedBy",
  as: "auditLogs",
});

module.exports = AuditLog;
