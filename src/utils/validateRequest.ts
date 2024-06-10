import express from 'express'
import { Schema } from 'joi'

type SchemaType = Schema
const validateRequest =
  (schema: SchemaType, path: 'body' | 'params' | 'query' = 'body') =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const { error } = schema.validate(req[path])
    if (error) {
      return res.status(400).json({ message: error.details[0].message })
    }
    return next()
  }

export default validateRequest
