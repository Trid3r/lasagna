import express from "express";
import dotenv from "dotenv";
import EasyGpt from "easygpt";

dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
app.use(express.json());

const gpt = new EasyGpt();

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
