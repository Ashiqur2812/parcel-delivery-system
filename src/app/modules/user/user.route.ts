import express from 'express';
import { validateRequest } from '../../middleware/validationRequest';
import { blockUserZodSchema, createUserZodSchema, updateUserZodSchema } from './user.validation';
import { UserController } from './user.controller';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from './user.interface';
import { checkUserOwnerOrAdmin } from '../../middleware/checkUserOwnerOrAdmin';

const router = express.Router();

router.post('/register', validateRequest(createUserZodSchema), UserController.createUser);

router.get('/all-users', checkAuth(Role.ADMIN), UserController.getAllUsers);

router.patch('/block/:id', checkAuth(Role.ADMIN), validateRequest(blockUserZodSchema), UserController.blockUserController);

router.delete('/:id', checkAuth(Role.ADMIN), UserController.deleteUser);

router.patch('/:id', validateRequest(updateUserZodSchema), checkAuth(Role.ADMIN, Role.SENDER, Role.RECEIVER), checkUserOwnerOrAdmin, UserController.updateUser);

export const userRoutes = router;