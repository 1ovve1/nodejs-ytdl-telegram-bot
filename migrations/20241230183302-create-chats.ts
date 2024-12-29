import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Chats table",
  async up(params): Promise<void> {
    await params.context.createTable('chats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      tg_id: {
        allowNull: false,
        type: DataTypes.BIGINT
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
    await params.context.dropTable('chats');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

