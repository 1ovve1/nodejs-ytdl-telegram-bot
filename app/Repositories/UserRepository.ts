import User from "../../models/users";
import {Api} from "telegram";

export interface UserRepositoryInterface {
    findById(id: number): Promise<User>;

    isExistsById(id: number): Promise<boolean>;

    create(user: Api.TypeUser): Promise<User>
}

export class UserRepository implements UserRepositoryInterface {
    async findById(id: number): Promise<User> {
        const user = await User.findOne({ where: { tg_id: id } });

        if (user === null) {
            throw new Error('User not found');
        }

        return user;
    }

    async isExistsById(id: number): Promise<boolean> {
        try {
            await this.findById(id);

            return true;
        } catch (error) {
            return false;
        }
    }

    async create(user: Api.TypeUser): Promise<User> {

        if (user instanceof Api.User) {
            return User.create({
                tg_id: Number(user.id),
                first_name: user.firstName ?? '',
                last_name: user.lastName ?? '',
                username: user.username ?? '',
            });
        } else {
            return User.create({
                tg_id: Number(user.id),
                first_name: '',
                last_name: '',
                username: '',
            });
        }
    }
}