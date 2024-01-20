import express from 'express';
import EventController from './EventController';
import UserController from './UserController';
import { isLoggedIn } from '../middleware/auth';

const router = express.Router();
const eventController = new EventController();

router.post('/create', eventController.createEvent);
router.post('/receive', eventController.receiveEvent);
router.get('/list', isLoggedIn, eventController.listEvents);

const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/user/:username', userController.get);
router.get('/check-session', userController.checkSession);

export default router;