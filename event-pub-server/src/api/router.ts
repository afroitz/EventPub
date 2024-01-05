import express from 'express';
import EventController from './EventController';
import UserController from './UserController';

const router = express.Router();
const eventController = new EventController();

router.post('/create', eventController.createEvent);
router.post('/receive', eventController.receiveEvent);

const userController = new UserController();

router.post('/register', userController.register);

export default router;