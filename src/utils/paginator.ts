import { Request, Response, NextFunction } from 'express'


const Paginator =(req:Request, res:Response)=>{
        const page: number =
    Number.parseInt(req.query.page as unknown as string, 10) || 1
    const limit: number =
    Number.parseInt(req.query.limit as unknown as string, 10) || 5

    if (
    Number.isNaN(page) ||
    Number.isNaN(limit) ||
    page <= 0 ||
    limit <= 0
    ) {
    return null
    }
    const offset = (page - 1) * limit

    const result = {offset, limit, page}
    return result
}



export default Paginator