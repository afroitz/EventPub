import { NextFunction, Request, Response } from "express";
import EventRepository from "../db/EventRepository";  
// import { uuid } from "drizzle-orm/pg-core";
import {v4 as uuidv4} from 'uuid';


class EventController {

  repository: EventRepository

  constructor() {
    this.repository = new EventRepository();
  }

  public listEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await this.repository.list()

      // check whether user is owner of event and add this info to response
      const responseData = events.map((event) => {
        return {
          isOwner: event.attributedTo == `${process.env.APP_URL}/users/${req.session.user?.username}`,
          data: event
        }
      })

      res.status(200).send(responseData);
    } catch (e){
      console.log(e);
      return res.status(500).send("error listing events");
    }
  }

  public receiveEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      console.log('receiving event'.toUpperCase());

      const {
        context: context,
        type: type,
        actor: attributedTo,        
      } = req.body;

      console.log('received event:'.toUpperCase());
      console.log('context:', context);
      console.log('type:', type);
      console.log('attributedTo:', attributedTo);

      if (type == 'Create') {
        console.log('received create event');
        await this.handleCreate(req, res, next);
      }
      if (type == 'Update') {
        console.log('received update event');
        await this.handleUpdate(req, res, next);
      }
      if (type == 'Accept') {
        console.log('received accept event');
        await this.handleAccept(req, res, next);
      }      
      if (type == 'Reject') {
        console.log('received reject event');
        await this.handleReject(req, res, next);
      } 
      if (type == 'Undo') {
        console.log('received delete event');
        //await this.handleUndo(req, res, next);
      }                      
      if (type == 'Delete') {
        console.log('received delete event');
        await this.handleDelete(req, res, next);
      }                     

    }catch(e){
      console.log('error receiving event');
      console.log(e);
    }
  }

  public handleCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      console.log('processing create event'.toUpperCase());

      const {
        actor: attributedTo,        
        object: {
          id: id,
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
        });
        console.log('event saved in db');
      } catch(e) {
        console.log('error saving event in db');
        console.log(e);
      }
      
      //console.log('req:', req);
      res.status(200).send("Event created");

    } catch (e) {
      console.error(e);
      res.status(500).send("Error creating event");
    }
  }

  public handleUpdate = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
      
      console.log('processing update event'.toUpperCase());

      const {
        actor: attributedTo,        
        object: {
          id: id,
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
        await this.repository.update({
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
        });
        console.log('event updated in db');
      } catch(e) {
        console.log('error updating event in db');
        console.log(e);
      }
      
      res.status(200).send("Event updated");

    } catch (e) {
      console.error(e);
      res.status(500).send("Error updating event");
    }
  
  }

  public handleDelete = async (req: Request, res: Response, next: NextFunction) => {

    try {
      
      console.log('processing delete event'.toUpperCase());

      const {    
        object: {
          id: id,
          name: name,
        },
      } = req.body;

      try{
        await this.repository.delete({
          id: id,
        });
      } catch(e) {
        console.log('error deleting event ${id}');
        console.log(e);
      }
      
      res.status(200).send("Event deleted");

    } catch (e) {
      console.error(e);
      res.status(500).send("Error deleting event");
    }
  
  }  

  public handleAccept = async (req: Request, res: Response, next: NextFunction) => {

    try {
      
      console.log('processing accept event'.toUpperCase());

      const {    
        actor: actor,
        object: {
          id: id,
        },
      } = req.body;

      try{
        // get event from db
        const accepted_event = await this.repository.getEvent({id: id});

        // add actor to accepted 
        console.log('Adding actor to accepted');
        accepted_event[0].accepted = accepted_event[0].accepted + ', ' + actor;        

        // update event in db
        await this.repository.update({
          id: id,
          attributedTo: accepted_event[0].attributedTo,
          name: accepted_event[0].name,
          content: accepted_event[0].content,
          startTime: accepted_event[0].startTime,
          endTime: accepted_event[0].endTime,
          location: accepted_event[0].location,
          accepted: accepted_event[0].accepted,
          rejected: accepted_event[0].rejected,
          published: accepted_event[0].published,
          updated: accepted_event[0].updated,
        });

      } catch(e) {
        console.log('error updating event');
        console.log(e);
      }
      
      res.status(200).send("Accepted invitation added");

      } catch (e) {
        console.error(e);
        res.status(500).send("Error accepting invite");
      } 
  }  

  public handleReject = async (req: Request, res: Response, next: NextFunction) => {

    try {
      
      console.log('processing reject event'.toUpperCase());

      const {    
        actor: actor,
        object: {
          id: id,
        },
      } = req.body;

      try{
        // get event from db
        const accepted_event = await this.repository.getEvent({id: id});

        // add actor to accepted 
        console.log('Adding actor to rejected');
        accepted_event[0].rejected = accepted_event[0].rejected + ', ' + actor;  

        console.log('updated event:', accepted_event);        

        // update event in db
        await this.repository.update({
          id: id,
          attributedTo: accepted_event[0].attributedTo,
          name: accepted_event[0].name,
          content: accepted_event[0].content,
          startTime: accepted_event[0].startTime,
          endTime: accepted_event[0].endTime,
          location: accepted_event[0].location,
          accepted: accepted_event[0].accepted,
          rejected: accepted_event[0].rejected,
          published: accepted_event[0].published,
          updated: accepted_event[0].updated,
        });

      } catch(e) {
        console.log('error updating event');
        console.log(e);
      }
      
      res.status(200).send("Rejected invitation added");

      } catch (e) {
        console.error(e);
        res.status(500).send("Error rejecting invite");
      }
        
  }    

  public createEvent =  async (req: Request, res: Response, next: NextFunction) => {

    // this should have auth: only logged in users should be able to create events

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