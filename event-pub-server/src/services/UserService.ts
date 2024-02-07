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

  /**
   * Returns the user's server domain from the federation id
   * @param federationId
   */
  public getUserServerUrl(federationId: string){
    return federationId.split("/").slice(0, 3).join("/");
  }
}

export default UserService;