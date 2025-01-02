import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';
import Video from "./videos";  // Import the configured Sequelize instance

interface AudioFormatAttributes {
    id: number;
    video_id: number;
    format: string;
    label: string;
}

export interface AudioFormatCreationAttributes extends Optional<AudioFormatAttributes, 'id'> {}

class AudioFormat extends Model<AudioFormatAttributes, AudioFormatCreationAttributes> implements AudioFormatAttributes {
    declare id: number;
    declare video_id: number;
    declare format: string;
    declare label: string;
}

AudioFormat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        }
    },
    {
        sequelize,  // Pass the Sequelize instance
        tableName: 'audio_formats',  // The table name (should match your DB table)
        modelName: 'AudioFormat',
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

export default AudioFormat;