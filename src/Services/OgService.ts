import puppeteer, { Browser } from "puppeteer";
import path from "path";
import fs from "fs/promises";

let browser: Browser;

export async function generateOgImage(
  title: string,
  content: string
): Promise<Buffer> {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  const page = await browser.newPage();
  
  const templatePath = path.join(__dirname, "../template.html");
  const htmlContent = fs.readFile(templatePath, "utf8");

  await page.setContent(await htmlContent, { waitUntil: "networkidle0" });

  await page.evaluate(
    (title, content) => {
      const titleElement = document.getElementById("title");
      if (titleElement) {
        titleElement.textContent = title;
      }
      const contentElement = document.getElementById("content");
      if (contentElement) {
        contentElement.textContent = content;
      }
    },
    title,
    content
  );

  const imageBuffer = await page.screenshot({
    type: "png",
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });

  await page.close();

  return imageBuffer;
}