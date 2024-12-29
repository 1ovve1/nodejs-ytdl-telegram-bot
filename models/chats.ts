import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';  // Import the configured Sequelize instance

interface ChatAttributes {
    id: number;
    tg_id: number;
}

interface ChatCreationAttributes extends Optional<ChatAttributes, 'id'> {}

class Chat extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
    declare id: number;
    declare tg_id: number;
}

Chat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        tg_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,  // Pass the Sequelize instance
        tableName: 'chats',  // The table name (should match your DB table)
        modelName: 'Chat',
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

export default Chat;