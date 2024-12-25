import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';
import Video from "./videos";  // Import the configured Sequelize instance

interface VideoFormatAttributes {
    id: number;
    video_id: number;
    format: string;
    label: string;
}

interface FormatCreationAttributes extends Optional<VideoFormatAttributes, 'id'> {}

class VideoFormat extends Model<VideoFormatAttributes, FormatCreationAttributes> implements VideoFormatAttributes {
    declare id: number;
    declare video_id: number;
    declare format: string;
    declare label: string;
}

VideoFormat.init(
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
        tableName: 'video_formats',  // The table name (should match your DB table)
        modelName: 'VideoFormat',
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

export default VideoFormat;