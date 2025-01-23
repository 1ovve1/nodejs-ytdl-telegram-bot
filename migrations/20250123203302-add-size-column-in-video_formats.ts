import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Add size (in bytes) column for audio formats",
  async up(params): Promise<void> {
    await params.context.addColumn('audio_formats', 'size', {
      type: DataTypes.INTEGER,
    });
  },
  async down(params): Promise<void> {
    await params.context.removeColumn('audio_formats', 'size');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

