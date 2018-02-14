import bodyParser from "body-parser";
import cors from "cors";

export default (app) => {
  const sites = /^http(s?):\/\/.*.?(newspring|newspringfuse|newspringnetwork|apollos.netlify|newspring.github).(com|cc|io|dev)\/?$/;
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

  app.get("/util/ping", (req, res) => {
    res.status(200).end();
  });
};
