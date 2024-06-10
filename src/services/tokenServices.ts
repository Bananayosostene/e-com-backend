import jwt, { JwtPayload } from 'jsonwebtoken'
import express from 'express'
import User from '../database/models/userModel'
import Token from '../database/models/tokenModel'

export const getTokenById = async (id: number) => {
  const token = await Token.findOne({ where: { id } })
  return token
}

export const getTokenByUserId = async (userId: number) => {
  const token = await Token.findOne({ where: { userId } })
  return token
}

export const getTokenByTokenValue = async (token: string) =>
  Token.findOne({ where: { token } })

export const createToken = async (details: object) => Token.create(details)

export const deleteTokenByTokenValue = (token: string) =>
  Token.destroy({ where: { token } })

export const deleteTokenByUserId = (userId: number) =>
  Token.destroy({ where: { userId } })

export const validateAndRetrieveToken = async (token: string) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: false,
    }) as JwtPayload
    const myToken = await getTokenByTokenValue(token)

    if (!myToken) {
      return null
    }

    return decodedToken
  } catch (error) {
    return null
  }
}

export const validateRedisToken = (token: string) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_RESET,
    ) as JwtPayload
    return decoded
  } catch (error) {
    return null
  }
}
