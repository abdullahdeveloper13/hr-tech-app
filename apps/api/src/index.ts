import "dotenv/config"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { apiRouter } from "./routes"
import { errorHandler } from "./middleware/error"

const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? true,
  credentials: true,
}))
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/health", (_req, res) => {
  res.json({ ok: true })
})

app.use("/api", apiRouter)

app.use(errorHandler)

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => {
  console.log(`[api] listening on :${port}`)
})
