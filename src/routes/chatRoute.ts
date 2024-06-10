import path from 'path'
import { Router } from 'express'
const router = Router()

router.get('/', async (req, res) => {
  res.sendFile(path.resolve('public/chart.html'))
})

export default router
