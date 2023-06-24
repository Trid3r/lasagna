// Imports
import express from "express";
import dotenv from "dotenv";
import EasyGpt from "easygpt";

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
  .addMessage("Hello! How are you")
  .advanced.setMaxTokens(100)
  .advanced.setTemperature(1.5);


//Endpoint
app.post("/askgpt", async (req, res) => {
  const messages = req.body.messages;
  console.log(messages)
  // try {
  //   const responses = await Promise.all(
  //     messages.map(async message => {
  //       gpt.addMessage(message.content);
  //       return await gpt.ask();
  //     })
  //   );

  //   const answers = responses
  //     .filter((response, index) => messages[index].role !== "system")
  //     .map(response => response.content);

  //   console.log(answers);

  //   res.json({ answers });
  // } catch (error) {
  //   console.error(error);

  //   res.status(500).json({
  //     error: "Failed to ask ChatGPT API. Error: " + error,
  //   });
  // }
  
});

// Run
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));
