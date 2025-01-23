import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Add size (in bytes) column for video formats",
  async up(params): Promise<void> {
    await params.context.addColumn('video_formats', 'size', {
      type: DataTypes.INTEGER,
    });
  },
  async down(params): Promise<void> {
    await params.context.removeColumn('video_formats', 'size');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

