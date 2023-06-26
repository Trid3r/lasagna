// Imports
import express from "express";
import dotenv from "dotenv";
import EasyGpt from "easygpt";
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';

// Constants
dotenv.config();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const port = process.env.PORT || 3001;
const app = express();
app.use(express.json());

//Set GPT
const gpt = new EasyGpt();
gpt
  .setApiKey(OPENAI_API_KEY)
  .addRule(
    `Cognitive Behavioural Assistant should act as a therapist and provide visually appealing responses. Use phrases commonly associated with therapists,
    such as 'How does that make you feel?' or 'Tell me more about that.' PERSONALIZE responses to the user's input and emotional state.
    Ensure responses are grammatically correct and written in a professional yet conversational tone. Provide timely responses without significant delay.`
  )
  .addRule("Use emoticons in every answer and super often.")
  .advanced.setMaxTokens(100)
  .advanced.setTemperature(1.5);

  //Set SQLite DB
const db = new sqlite3.Database('./jwt.db');
const createTableQuery = 'CREATE TABLE IF NOT EXISTS tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT)';
db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error al crear la tabla:', err);
  } else {
    console.log('BD ready');
  }
});
db.close();

//Function to validate token if was used and saved is not exist
function tokenProcess(token) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('./jwt.db');
    db.get('SELECT EXISTS(SELECT 1 FROM tokens WHERE token = ?) as tokenExist', [token], (err, row) => {
      if (err) {
        reject(err);
      } else {
        if(row.tokenExist){
          resolve(false);
        } else {
          db.run('INSERT INTO tokens (token) VALUES (?)', [token], function (err) {
            if (err) {
              reject(err);
            } else {
              resolve(true);
            }
          });
        }
      }
    });

    db.close();
  });
}

//Function to call chagpt
async function handleChatLogic(res, messages) {
  try {
    const responses = await Promise.all(
      messages.map(async (message) => {
        gpt.addMessage(message.content);
        return await gpt.ask();
      })
    );

    const answers = responses
      .filter((response, index) => messages[index].role !== 'system')
      .map((response) => response.content);

    res.json({ answers });
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'Failed to ask ChatGPT API. Error: ' + error });
  }
}

//Endpoint
app.post("/askgpt", async (req, res) => {
  const messages = req.body.messages; // Obten el mensaje para chatGPT
  const tokenWithBearer = req.headers['authorization']; // Obtén el token con 'Bearer' al principio
  
  if (!tokenWithBearer) { // Si no se proporcionó ningún token en el encabezado 'Authorization'
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  
  const token = tokenWithBearer.replace(/^Bearer\s+/, ''); // Elimina 'Bearer' y el espacio en blanco al principio

  // Verificar y decodificar el token JWT
  jwt.verify(token, 'BigBola', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    tokenProcess(token)
    .then((tokenSaved) => {
      if (!tokenSaved) return res.status(401).json({ error: 'Token usado' });
      else handleChatLogic(res, messages);
    })
    .catch((err) => {
      return res.status(401).json({ error: 'Error al guardar el token: '+err });
    });

  });

});

// Run
const server = app.listen(port, () => console.log(`App running on port ${port}!`));
