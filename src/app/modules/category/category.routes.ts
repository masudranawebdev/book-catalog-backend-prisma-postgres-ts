import { Router } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryValidation } from './category.validation';

const router = Router();

router.post(
  '/create-category',
  validateRequest(CategoryValidation.create),
  auth(ENUM_USER_ROLE.ADMIN),
  CategoryController.insertIntoDB
);

export const CategoryRoutes = router;
