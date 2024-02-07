import { Request, Response } from "express"
import FederationService from "../services/FederationService";

class FederationController {

  service: FederationService;

  constructor() {
    this.service = new FederationService();
  }

  public inbox = async (
    req: Request,
    res: Response,
  ) => {
    try {
      if(!req.body.type) {
        throw new Error("Unknown message format");
      }

      const type = req.body.type;

      if (type == "Create") {
        console.log("received create event");
        await this.service.handleCreate(req.body);
      }
      if (type == "Update") {
        console.log("received update event");
        await this.service.handleUpdate(req.body);
      }
      if (type == "Accept") {
        console.log("received accept event");
        await this.service.handleAccept(req.body);
      }
      if (type == "Reject") {
        console.log("received reject event");
        await this.service.handleReject(req.body);
      }
      if (type == "Undo") {
        console.log("received undo event");
        
        if(req.body.object.type == "Accept") {
          await this.service.handleUndoAccept(req.body);
        } else if(req.body.object.type == "Reject") {
          await this.service.handleUndoReject(req.body);
        }
      }
    } catch (e) {
      console.log("Error in inbox endpoint");
      console.log(e);
      res.status(500).send("Error processing message");
    }
  };
}

export default FederationController;