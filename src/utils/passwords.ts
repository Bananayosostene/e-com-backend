import bcrypt from 'bcrypt'
import { SLAT_ROUNDS } from '../config'

export const hashPassword = async (password: string) => {
  const slatRounds = await bcrypt.genSalt(SLAT_ROUNDS)
  const hashedPassword = await bcrypt.hash(password, slatRounds)
  return hashedPassword
}

export const comparePassword = async (
  password: string,
  hashedPassword: string,
) => {
  const compare = await bcrypt.compare(password, hashedPassword)
  return compare
}
