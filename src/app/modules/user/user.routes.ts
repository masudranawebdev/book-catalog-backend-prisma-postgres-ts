import { Router } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { UserController } from './user.controller';

const router = Router();

router.get('/', auth(ENUM_USER_ROLE.ADMIN), UserController.getUsers);
router.get('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.getUser);
router.patch('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.updateUser);
router.delete('/:id', auth(ENUM_USER_ROLE.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
