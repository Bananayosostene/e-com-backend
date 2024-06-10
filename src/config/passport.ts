import passport, { Profile } from 'passport'
import {
  Strategy as GoogleStrategy,
  StrategyOptionsWithRequest,
} from 'passport-google-oauth20'
import { SinonSpy } from 'sinon'
import User, { UserAttributes } from '../database/models/userModel'
import { CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } from './index'

export const googleOAuthCallback = async (
  req: unknown,
  accessToken: string,
  refreshToken: string,
  profile: Profile,
  done: SinonSpy<unknown[], unknown>,
) => {
  try {
    if (!profile.emails || profile.emails.length === 0) {
      return done(new Error('Email not found in the Google profile'), undefined)
    }

    const email = profile.emails[0].value

    const existingUser = await User.findOne({ where: { email } })

    if (existingUser) {
      return done(null, existingUser)
    }

    const newUserAttributes: Partial<UserAttributes> = {
      username: profile.name?.givenName,
      email,
    }

    const newUser = await User.create(newUserAttributes as UserAttributes)
    return done(null, newUser)
  } catch (error) {
    done(error as Error, undefined)
  }
}

const googleStrategyOptions: StrategyOptionsWithRequest = {
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  passReqToCallback: true,
}

passport.use(new GoogleStrategy(googleStrategyOptions, googleOAuthCallback))

passport.serializeUser((user: User, done: SinonSpy<unknown[], unknown>) => {
  const typedUser = user as User
  done(null, typedUser.id)
})

passport.deserializeUser(
  async (id: string, done: SinonSpy<unknown[], unknown>) => {
    const user = await User.findByPk(id)
    done(null, user)
  },
)

export default passport
