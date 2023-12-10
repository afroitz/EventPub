import express from 'express';
import EventController from './EventController';

const router = express.Router();
const eventController = new EventController();

router.post('/create', eventController.createEvent);

export default router;