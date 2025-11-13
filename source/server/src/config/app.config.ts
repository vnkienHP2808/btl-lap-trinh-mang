import express from 'express'
import cors from 'cors'
import { Express } from 'express'
/**
 * Hàm cấu hình các middleware cơ bản cho Express app
 * @param app - thể hiện của express()
 */
export const setupApp = (app: Express) => {
  app.use(
    cors({
      origin: process.env.ALLOW_ORIGIN,
      credentials: true
    })
  )
  app.use(express.json())
}
