import { usersDAO } from '../dao/users.dao.js';

export class UsersRepository {
    async findByEmail(email) {
        return await usersDAO.findByEmail(email);
    }

    async findById(id) {
        return await usersDAO.findById(id);
    }

    async createUser(userData) {
        return await usersDAO.create(userData);
    }
}

export const usersRepository = new UsersRepository();