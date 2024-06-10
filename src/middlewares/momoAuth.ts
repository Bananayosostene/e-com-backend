
import { Response, Request, NextFunction } from 'express'
import axios from 'axios'
// import base64 from "base-64";
import { MOMO_XREFERENCED, MOMO_API_KEY, MOMO_SUBSCRIPTION_KEY } from '../config/index';

declare global {
    namespace Express {
      interface Request {
        momoToken?: string
      }
    }
  }


  // ------------------------------------------MOMO-----------------------------------------

  export const momoToken = async (): Promise<{ Token:string } | null> => {
    const momoHost = 'sandbox.momodeveloper.mtn.com';
const momoTokenUrl = `https://${momoHost}/collection/token/`;
    try{
      const apiKey = MOMO_API_KEY
      const subscriptionKey = MOMO_SUBSCRIPTION_KEY

        const XReferenceId = MOMO_XREFERENCED
        const token = Buffer.from(`${XReferenceId}:${apiKey}`, 'utf8').toString('base64');
        const response = await axios.post(
            momoTokenUrl,
            {},
            {
                    headers: {
                            'Content-Type': 'application/json',
                            'Ocp-Apim-Subscription-Key': subscriptionKey,
                            Authorization: `Basic ${token}`,
                    },
            }
    );
        
    if (response.status === 200) {
      return response.data.access_token;
    } 

      return null;
    
  } catch (error) {
    return null
  }
    }

    export const renewMomoToken = async(req: Request, res: Response, next:NextFunction) => {
      const tokenData = await momoToken()
      req.momoToken = String(tokenData)
       next()
        }
