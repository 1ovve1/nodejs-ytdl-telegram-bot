import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';  // Import the configured Sequelize instance

interface ChatUserAttributes {
    id: number;
    chat_id: number;
    user_id: number;
}

interface ChatUserCreationAttributes extends Optional<ChatUserAttributes, 'id'> {}

class ChatUser extends Model<ChatUserAttributes, ChatUserCreationAttributes> implements ChatUserAttributes {
    declare id: number;
    declare chat_id: number;
    declare user_id: number;
}

ChatUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        chat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'chats',
                key: "id"
            },
            onDelete: 'CASCADE',
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            onDelete: 'CASCADE',
        }
    },
    {
        sequelize,  // Pass the Sequelize instance
        tableName: 'chat_users',  // The table name (should match your DB table)
        modelName: 'ChatUser',
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

export default ChatUser;