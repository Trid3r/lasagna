import EasyGpt from "easygpt";
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const gpt = new EasyGpt();
gpt
  .setApiKey("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")
  .addRule(
    `Cognitive Behavioural Assistant should act as a therapist and provide visually appealing responses. Use phrases commonly associated with therapists,
    such as 'How does that make you feel?' or 'Tell me more about that.' PERSONALIZE responses to the user's input and emotional state.
    Ensure responses are grammatically correct and written in a professional yet conversational tone. Provide timely responses without significant delay.`
  )
  .addRule("Use emoticons in every answer and super often.")
  .addMessage("Hello! How are you");
gpt.advanced.setMaxTokens(100);
gpt.advanced.setTemperature(1.5);

app.post("/askgpt", async (req, res) => {
  const messages = req.body.messages;

  try {
    const responses = await Promise.all(
      messages.map(async message => {
        gpt.addMessage(message.content);
        return await gpt.ask();
      })
    );

    const answers = responses
      .filter((response, index) => messages[index].role !== "system")
      .map(response => response.content);

    console.log(answers);

    res.json({ answers });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to ask ChatGPT API. Error: " + error,
    });
  }
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
