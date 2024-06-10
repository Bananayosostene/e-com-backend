
import express from 'express'
import { UUID } from 'crypto'
import User from '../database/models/userModel'
import Cart from '../database/models/cartModel'



export const getCart = (cartId: UUID, userId:number) =>
    Cart.findOne({ where: { id:cartId, status:"active", buyerId:userId } })

export const createNewcart = async (userId:number)=>{
    const cart = await Cart.create({
        buyerId: userId,
        items: [],
        totalPrice: 0,
        totalQuantity: 0,
        status: 'active',
      })

      return cart
}

 
export const clearCart = (cartId: UUID|string) => Cart.update({items:[], totalPrice:0, totalQuantity:0}, {where:{ id:cartId}})
