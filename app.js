// Imports
import express from "express";
import dotenv from "dotenv";
import EasyGpt from "easygpt";

// Constants
dotenv.config();
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const port = process.env.PORT || 3001;
const app = express();
app.use(express.json());

//Set GPT
const gpt = new EasyGpt();

// Run
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
