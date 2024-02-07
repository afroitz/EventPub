import express from 'express';
import EventController from './EventController';
import UserController from './UserController';
import { isLoggedIn } from '../middleware/auth';
import FederationController from './FederationController';

const router = express.Router();

const eventController = new EventController();
router.post('/create', isLoggedIn, eventController.create);
router.post('/rsvp', isLoggedIn, eventController.rsvp);
router.get('/list', isLoggedIn, eventController.list);
router.get('/events/:id', eventController.get);

const userController = new UserController();
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', isLoggedIn, userController.logout);
router.get('/users/:username', userController.get);
router.get('/check-session', userController.checkSession);

const federationController = new FederationController();
router.post('/inbox', federationController.inbox);

export default router;