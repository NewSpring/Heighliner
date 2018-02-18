import Raven from "raven";

let sentry;

if (process.env.SENTRY) {
  sentry = new Raven.Client(process.env.SENTRY);
}

const report = ({ data, attemptsMade = 1 }, error) => {
  if (!sentry) {
    if (!process.env.CI) console.error("ERROR", error);
    return;
  }

  // don't log to sentry or slack on every attempt
  // only log of the first event if possible
  if (!attemptsMade || attemptsMade !== 1) return;

  if (data && data.Person) {
    sentry.setUserContext({ id: data.Person.Id });
    if (data.Person.Email) sentry.setUserContext({ email: data.Person.Email });
  }

  sentry.captureException(error, { extra: { data, attemptsMade } });

  // only log to slack the first time an error has happened
  if (process.env.SLACK) {
    const message = {
      username: "Heighliner",
      icon_emoji: ":feelsbulbman:",
      text: `ATTENTION: ${error.message}`,
      channel: "systems",
    };

    fetch(process.env.SLACK, {
      method: "POST",
      body: JSON.stringify(message),
    });
  }
};

export default report;
