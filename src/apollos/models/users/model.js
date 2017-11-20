import moment from "moment";
import api from "./rockAPI";

export class User {
  async getByBasicAuth(userPasswordString = "") {
    // Client needs to encode user and password and join by ':'
    // for all user requests including login
    try {
      const userPasswordTuple = userPasswordString.split(":");
      const username = decodeURIComponent(userPasswordTuple[0]);
      const password = decodeURIComponent(userPasswordTuple[1]);

      const isAuthorized = await this.checkUserCredentials(username, password);
      if (!isAuthorized) throw new Error("User not authorized");

      const [user] = await api.get(`UserLogins?$filter=UserName eq '${username}'`);
      return user;
    } catch (err) {
      throw err;
    }
  }

  async checkUserCredentials(Username, Password) {
    try {
      const isAuthorized = await api.post("Auth/login", {
        Username,
        Password,
      });
      return isAuthorized && !isAuthorized.statusText;
    } catch (err) {
      throw err;
    }
  }

  async loginUser(user = {}) {
    try {
      if (!user.IsConfirmed) {
        api.post(`UserLogins/${user.Id}`, {
          IsConfirmed: true,
        });
      }

      api.patch(`UserLogins/${user.Id}`, {
        LastLoginDateTime: `${moment().toISOString()}`,
      });

      return user;
    } catch (err) {
      throw err;
    }
  }

  createUserProfile(props = {}) {
    const {
      email,
      firstName,
      lastName,
    } = props;

    return api.post("People", {
      Email: email,
      Guid: makeNewGuid(),
      FirstName: stripTags(firstName),
      LastName: stripTags(lastName),
      IsSystem: false,
      Gender: 0,
      RecordTypeValueId: 1,
      ConnectionStatusValueId: 67, // Web Prospect
      SystemNote: "Created from NewSpring Apollos",
    });
  }

  createUser(props = {}) {
    const {
      email,
      password,
      personId,
    } = props;

    return api.post("UserLogins", {
      PersonId: personId,
      EntityTypeId: 27,
      UserName: email,
      IsConfirmed: true,
      PlainTextPassword: password,
      LastLoginDateTime: `${moment().toISOString()}`,
    });
  }

  async registerUser(props = {}) {
    const {
      email,
      firstName,
      lastName,
      password,
    } = props;

    const personId = await this.createUserProfile({
      email,
      firstName,
      lastName,
    });

    const userId = await this.createUser({
      email,
      password,
      personId,
    });

    const user = await api.get(`UserLogins/${userId}`);
    const person = await api.get(`People/${personId}`);
    // const [systemEmail] = await api.get("SystemEmails?$filter=Title eq 'Account Created'");
    // const Email = await api.get(`SystemEmails/${systemEmail.Id}`);
    // console.log('send confirmation email');

    return userId;
  }
}

export default {
  User,
};
