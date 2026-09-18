import { UserModel } from '../models/User.js';

export class UsersDAO {
    async findAll() {
        return await UserModel.find().select('-password');
    }

    async findByEmail(email) {
        return await UserModel.findOne({ email });
    }

    async findById(id) {
        return await UserModel.findById(id);
    }

    async create(userData) {
        return await UserModel.create(userData);
    }
}

export const usersDAO = new UsersDAO();