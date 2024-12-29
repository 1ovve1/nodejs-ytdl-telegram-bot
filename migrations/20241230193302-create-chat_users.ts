import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Chat users table",
  async up(params): Promise<void> {
    await params.context.createTable('chat_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      chat_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'chats',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE
      }
    })
  },
  async down(params): Promise<void> {
    await params.context.dropTable('chat_users');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

