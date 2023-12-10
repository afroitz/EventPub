import express from 'express';
import EventController from './EventController';

const router = express.Router();
const eventController = new EventController();

router.post('/create', eventController.createEvent);
router.post('/receive', eventController.receiveEvent);

export default router;