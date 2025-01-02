import {DataTypes, QueryInterface} from "sequelize";
import {MigrationFn, RunnableMigration} from "umzug";

const migration: RunnableMigration<QueryInterface> = {
  name: "Audio formats table",
  async up(params): Promise<void> {
    await params.context.createTable('audio_formats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      video_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'videos',
          key: 'id',
        },
        onDelete: "CASCADE",
      },
      format: {
        type: DataTypes.JSON,
      },
      label: {
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
    await params.context.dropTable('audio_formats');
  }
}

export const up: MigrationFn<QueryInterface> = migration.up;
export const down = migration.down;

