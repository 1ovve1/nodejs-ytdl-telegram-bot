import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Add title column in videos table",
  async up(params): Promise<void> {
    await params.context.addColumn('videos', 'title', {
      type: DataTypes.STRING,
    });
  },
  async down(params): Promise<void> {
    await params.context.removeColumn('videos', 'title');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

