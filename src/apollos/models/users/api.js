import axios from "axios";

export default axios.create({
  baseURL: `${process.env.ROCK_URL}api`,
  headers: {
    "Authorization-Token": process.env.ROCK_TOKEN,
    "Content-Type": "application/json",
  },
});
