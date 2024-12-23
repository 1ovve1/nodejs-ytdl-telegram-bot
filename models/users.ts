import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../sequelize';  // Import the configured Sequelize instance

interface UserAttributes {
  id: number;
  tg_id: number,
  username: string;
  first_name: string;
  last_name: string;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    declare id: number;
    declare tg_id: number;
    declare username: string;
    declare first_name: string;
    declare last_name: string;
}

User.init(
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
        username: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,  // Pass the Sequelize instance
        tableName: 'users',  // The table name (should match your DB table)
        modelName: 'User',
        updatedAt: "updated_at",
        createdAt: "created_at",
    }
);

export default User;