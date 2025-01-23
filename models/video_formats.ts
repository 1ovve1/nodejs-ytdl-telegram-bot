import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';
import Video from "./videos";
import {FileSystemService} from "../app/Services/FileSystem/FileSystemService";

interface VideoFormatAttributes {
    id: number;
    video_id: number;
    format: string;
    size: number;
    label: string;
}

export interface VideoFormatCreationAttributes extends Optional<VideoFormatAttributes, 'id'> {}

class VideoFormat extends Model<VideoFormatAttributes, VideoFormatCreationAttributes> implements VideoFormatAttributes {
    declare id: number;
    declare video_id: number;
    declare format: string;
    declare size: number;
    declare label: string;

    humanizeFileSize(): string {
        return new FileSystemService().resolveHumanizeFileSizeByGivenBytes(this.size)
    }
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
        size: {
            type: DataTypes.INTEGER,
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