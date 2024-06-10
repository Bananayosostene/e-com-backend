import { string } from 'joi'
import User from '../database/models/userModel'
import UserProfile from '../database/models/userProfile'

export const createUserProfile = async (userId: number) => {
  const existingUser = await User.findOne({ where: { id: userId } })
  const existingUserProfile = await UserProfile.findOne({
    where: { userId: userId },
  })
  if (!existingUserProfile && existingUser) {
    const newUserProfile = new UserProfile({
      username: existingUser.username,
      email: existingUser.email,
      userId: existingUser.id,
    })
    await newUserProfile.save()
  }
}

export const getUserByEmail = async (email: string) =>
  User.findOne({ where: { email } })

export const getUserById = async (id: number) => {
  const user = await User.findOne({ where: { id } })
  return user
}

export const getUserProfileById = async (id: number) => {
  const user = await UserProfile.findOne({ where: { userId: id } })
  return user
}

export const getUserByUsername = async (username: string) =>
  User.findAll({ where: { username } })

export const createUser = async (details: object) => User.create(details)

export const getUserByRole = (userRole: string) =>
  User.findAll({ where: { userRole } })

export const deleteUserById = (id: string) => User.destroy({ where: { id } })

export const updateUserById = (fieldsToUpdate: object, id: number) =>
  User.update(fieldsToUpdate, { where: { id } })

export const updateUserProfileById = (fieldsToUpdate: object, id: number) =>
  UserProfile.update(fieldsToUpdate, { where: { userId: id } })
