import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  const { to, subject, body_plain, access_token } = req.body;
  if (!to || !subject || !body_plain || !access_token)
    return res.status(400).json({ error: "Missing required fields." });

  const email = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=UTF-8",
    "",
    body_plain,
  ].join("\r\n");

  const base64UrlEmail = Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: base64UrlEmail }),
    }
  );

  const data = await response.json();
  res.status(response.status).json(data);
});

app.listen(3000, () => console.log("✅ Server running on port 3000"));
