import { DbUser } from "../db/schema";

class UserService {
  /**
   * Returns an ActivityPub representation of user
   */
  public getApUser(user: DbUser) {
    return {
      "@context": "https://www.w3.org/ns/activitystreams",
      "type": "Person",
      "id": this.getUserFederationId(user.username),
      "name": user.username
    }
    
  }

  /**
   * Returns the user's federation ID
   * @param username 
   */
  public getUserFederationId(username: string){
    return `${process.env.APP_URL}/users/${username}`
  }
}

export default UserService;