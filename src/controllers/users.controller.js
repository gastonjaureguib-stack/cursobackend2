import { usersService } from '../services/users.service.js';
import { UserDTO } from '../dto/user.dto.js';


export const getUsers = async (req, res, next) => {
    try {
        const users =
            await usersService.getUsers();


        const usersDTO = users.map(
            (user) => new UserDTO(user)
        );


        return res.status(200).json({
            status: 'success',
            payload: usersDTO
        });

    } catch (error) {
        next(error);
    }
};