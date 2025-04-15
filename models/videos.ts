import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';
import VideoFormat from "./video_formats";  // Import the configured Sequelize instance

interface VideoAttributes {
   id: number;
   url: string;
   title: string;
}

interface VideoCreationAttributes extends Optional<VideoAttributes, 'id'> {}

class Video extends Model<VideoAttributes, VideoCreationAttributes> implements VideoAttributes {
    declare id: number;
    declare url: string;
    declare title: string;
}

Video.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        sequelize,  // Pass the Sequelize instance
        tableName: 'videos',  // The table name (should match your DB table)
        modelName: 'Video',
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

export default Video;