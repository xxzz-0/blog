import express from 'express'
import { renderPage } from 'vite-plugin-ssr/server'
import { createServer as createViteServer } from 'vite'

const app = express()
const port = 3000

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)

  app.get('*', async (req, res) => {
    const url = req.originalUrl

    try {
      const result = await renderPage({
        url,
        vite
      })

      if (result.httpResponse) {
        result.httpResponse.pipe(res)
      } else {
        res.send(result.html)
      }
    } catch (error) {
      vite.ssrFixStacktrace(error)
      console.error(error)
      res.status(500).send('Internal Server Error')
    }
  })

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

startServer()
