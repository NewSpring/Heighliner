import axios from "axios";

export default axios.create({
  baseURL: process.env.ROCK_URL,
  headers: {
    [process.env.ROCK_TOKEN_NAME]: process.env.ROCK_TOKEN, // Not too sure about this
    "Content-Type": "application/json",
  },
});
