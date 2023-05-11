import asyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'


/* 
@route   POST api/order
@desc    Create new order
@access  Private
*/
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order Items')
  } else {
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })

    const createdOrder = await order.save()

    res.status(201).json(createdOrder)
  }
})

/* 
@route   GET api/order/:id
@desc    Create new order
@access  Private
*/
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

/* 
@route   GET api/order/:id/pay
@desc    Update Order to paid
@access  Private
*/
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    }

    const updatedOrder = order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

/* 
@route   GET api/order/:id/deliver
@desc    Update order to deleiver
@access  Private/Admin
*/
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()
    const updatedOrder = order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

/* 
@route   GET api/order/myOrders
@desc    Get logged in users order
@access  Private
*/
const getUsersOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })

  if (orders.length === 0) {
    res.status(404)
    throw new Error('No orders found')
  }

  res.json(orders)
})

/* 
@route   GET api/order
@desc    Get all orders
@access  Private/Admin
*/
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name')
  res.json(orders)
})

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  getUsersOrders,
  updateOrderToDelivered,
  getOrders,
}