import express from 'express';
import EventController from './EventController';
import UserController from './UserController';
import { isLoggedIn } from '../middleware/auth';

const router = express.Router();
const eventController = new EventController();

/* Client facing event creation endpoint: This is used when a logged in user creates an event via the frontend */
router.post('/create', isLoggedIn, eventController.createEvent);

/* Client facing list events endpoint: Used for displaying events in UI. */
router.get('/list', isLoggedIn, eventController.listEvents);

router.post('/receive', eventController.receiveEvent);
router.get('/events/:id', eventController.get);

const userController = new UserController();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', isLoggedIn, userController.logout);
router.get('/users/:username', userController.get);
router.get('/check-session', userController.checkSession);

export default router;