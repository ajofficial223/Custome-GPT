import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

app.post("/send", async (req, res) => {
  const { to, subject, body_plain, body_html, access_token } = req.body;

  try {
    const boundary = "__ALT__";
    let message = `To: ${to}\r\nSubject: ${subject}\r\nMIME-Version: 1.0\r\n`;

    if (body_html) {
      message += `Content-Type: multipart/alternative; boundary=${boundary}\r\n\r\n`;
      message += `--${boundary}\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n${body_plain || ""}\r\n\r\n`;
      message += `--${boundary}\r\nContent-Type: text/html; charset="UTF-8"\r\n\r\n${body_html}\r\n--${boundary}--`;
    } else {
      message += `Content-Type: text/plain; charset="UTF-8"\r\n\r\n${body_plain}`;
    }

    // Base64URL encode
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send to Gmail
    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodedMessage }),
      }
    );

    const data = await gmailResponse.json();
    res.status(gmailResponse.status).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(3000, () => console.log("Gmail proxy running on port 3000"));
