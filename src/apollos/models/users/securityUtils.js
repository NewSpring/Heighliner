import crypto from "crypto";

const ALGORITHM = "aes-256-ctr";
const SECRET = process.env.SECRET || "LZEVhlgzFZKClu1r";

export function encrypt(text) {
  const cipher = crypto.createCipher(ALGORITHM, SECRET);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

export function decrypt(text) {
  const decipher = crypto.createDecipher(ALGORITHM, SECRET);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}
