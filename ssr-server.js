import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

async function startServer() {
  const isProduction = fs.existsSync(path.resolve("./dist"));

  if (isProduction) {
    app.use(express.static(path.resolve("./dist")));

    // 处理所有请求，返回index.html
    app.use((req, res) => {
      res.sendFile(path.resolve("./dist/index.html"));
    });

    console.log("生产模式：使用dist目录中的静态文件");
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);

    app.use(async (req, res) => {
      const url = req.originalUrl;

      try {
        const { render } = await vite.ssrLoadModule("/src/ssr-entry.js");
        const html = await render(url);
        res.send(html);
      } catch (error) {
        vite.ssrFixStacktrace(error);
        console.error(error);
        res.status(500).send("Internal Server Error");
      }
    });

    console.log("开发模式：使用Vite开发服务器");
  }

  app.listen(port, () => {
    console.log(`SSR server running at http://localhost:${port}`);
  });
}

startServer();
