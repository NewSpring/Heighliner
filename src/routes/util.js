
import bodyParser from "body-parser";
import cors from "cors";

export default (app) => {
  const sites = /^http(s?):\/\/.*.?(newspring|newspringfuse|newspringnetwork).(com|cc|io|dev)$/;
  const local = /^http(s?):\/\/localhost:\d*$/;

  const corsOptions = {
    origin: (origin, callback) => {
      const originIsWhitelisted = sites.test(origin) || local.test(origin);
      callback(null, originIsWhitelisted);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  app.use(bodyParser.urlencoded({
    extended: true,
  }));

  app.use(bodyParser.json());

  app.get("/alive", (req, res) => {
    res.status(200).json({ alive: true });
  });

  app.get("/graphql/ping", (req, res) => {
    res.status(200).end();
  });
};
