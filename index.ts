import express from "express";
import bodyParser from "body-parser";
import { generateOgImage } from "./src/Services/OgService";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const cache = new Map<string, Buffer>();

// Route to generate OG image
app.post("/generate-og-image", async (req, res) => {
  const encodedData = req.query.data as string;

  const decodedData = JSON.parse(
    Buffer.from(encodedData, "base64").toString("utf-8")
  );

  const { title, content } = decodedData;

  if (!title || !content) {
    return res.status(400).send("Title and content are required");
  }

  const cacheKey = `${title}-${content}`;
  if (cache.has(cacheKey)) {
    res.setHeader("Content-Type", "image/png");
    return res.send(cache.get(cacheKey));
  }

  try {
    const imageBuffer = await generateOgImage(title, content);
    cache.set(cacheKey, imageBuffer);
    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).send(`Error generating OG image: ${error.message}`);
  }
});

app.get("/", async (req, res) => {
  res.send("OG-Image-Generator");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
