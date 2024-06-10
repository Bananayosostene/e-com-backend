import { UserAttributes} from './database/models/userModel'

declare global {
  namespace Express {
      // eslint-disable-next-line @typescript-eslint/no-empty-interface
      interface User extends UserAttributes {}
      export interface Request {
          user?: UserAttributes;
      } } } 