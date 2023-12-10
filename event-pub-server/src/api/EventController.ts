import { NextFunction, Request, Response } from "express";
import EventRepository from "../db/EventRepository";  
// import { uuid } from "drizzle-orm/pg-core";
import {v4 as uuidv4} from 'uuid';


class EventController {

  repository: EventRepository

  constructor() {
    this.repository = new EventRepository();
  }

  public receiveEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const {
        object: {
          context: context,
          type: type,
          id: id,
          attributedTo: attributedTo,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: accepted,
          rejected: rejected,
          published: published,
          updated: updated,
        },
      } = req.body;

      console.log('received event:'.toUpperCase());
      console.log('context:', context);
      console.log('type:', type);
      console.log('id:', id);
      console.log('attributedTo:', attributedTo);
      console.log('name:', name);
      console.log('content:', content);
      console.log('startTime:', startTime);
      console.log('endTime:', endTime);
      console.log('location:', location);
      console.log('accepted:', accepted);
      console.log('rejected:', rejected);
      console.log('published:', published);
      console.log('updated:', updated);

      try{
        await this.repository.create({
          context: context,
          id: id,
          type: type,
          attributedTo: attributedTo,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: 'accepted',
          rejected: 'rejected',
          published: published,
          updated: updated,
        });
        console.log('event saved in db');
      } catch(e) {
        console.log('error saving event in db');
        console.log(e);
      }
      
      //console.log('req:', req);
      res.status(200).send("Event received");

    } catch (e) {
      console.error(e);
      res.status(500).send("Error receiving event");
    }
  }

  public createEvent =  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        context: context,
        id: id = uuidv4(),
        type: type,
        attributedTo: attributedTo,
        name: name,
        content: content,
        startTime: startTime,
        endTime: endTime,
        location: location,
        accepted: accepted,
        rejected: rejected,
        published: published,
        updated: updated,
        
      } = req.body;

      console.log('creating event'.toUpperCase());
      console.log('context', context);
      console.log('id', id);
      console.log('type', type);
      console.log('attributedTo', attributedTo);
      console.log('name', name);
      console.log('content', content);
      console.log('startTime', startTime);
      console.log('endTime', endTime);
      console.log('location', location);
      console.log('accepted', accepted);
      console.log('rejected', rejected);
      console.log('published', published);
      console.log('updated', updated);

      try{
        await this.repository.create({
          context: context,
          id: id,
          type: type,
          attributedTo: attributedTo,
          name: name,
          content: content,
          startTime: startTime,
          endTime: endTime,
          location: location,
          accepted: 'accepted',
          rejected: 'rejected',
          published: published,
          updated: updated,
        });
        console.log('event saved in db');
      } catch(e) {
        console.log('error saving event in db');
        console.log(e);
      }

      try{
        console.log('sending event to public'.toUpperCase());
        let createActivity = 
          {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Create",
            "id": attributedTo + "/" +id,
            "to":"test",
            "actor": attributedTo,
            "object": {
              "type": type,
              "id": attributedTo + "/" + id,
              "attributedTo": attributedTo,
              "name": name,
              "content": content,
              "startTime": startTime,
              "endTime": endTime,
              "location": location,
              "accepted": accepted,
              "rejected": rejected,
              "published": published,
              "updated": updated,
            }
        }

        // Wrap & Send the event to the public url
        let publicUrl = 'https://eo2kj3uk6ul5ycq.m.pipedream.net'; //replace with actual public url

        await fetch(publicUrl, {
          method: 'POST',
          body: JSON.stringify(createActivity),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('event sent to public');

      }catch(e){
        console.log('error sending event to public');
        console.log(e);
      }
      res.status(200).send("event created");
    } catch (e) {
      console.log(e);
      res.status(500).send("error creating event");
    } 
  }
}

export default EventController;