import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Videos table",
  async up(params): Promise<void> {
    await params.context.createTable('videos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      url: {
        type: DataTypes.STRING,
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
    await params.context.dropTable('videos');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

