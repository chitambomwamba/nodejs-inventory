const Order = require('../models/order')
const ObjectID = require('mongodb')
  .ObjectID
module.exports = function OrdersLogic(config, TransactionsLogic) {
  let saveOrder = (order) => {
    return new Order(order)
      .save()
  }

  let getOrders = (query) => (Order.find(query))

  let removeOrder = (query) => (Order.remove(query))

  let makeOrderEffective = (userId, orderId) => {
    return Order.findOneAndUpdate({ user: userId, '_id': new ObjectID(orderId) }, { $set: { 'effectiveDate': new Date() } })
      .then(order => {
        return TransactionsLogic.saveTransaction(order.transaction)
      })
  }
  let getItemsActiveOrders = (userID, itemsIDs, date) => {
    let ordersQuerybyItemIdAndUser = {
      user: userID,
      transaction: {
        item: {
          _id: {
            $in: itemsIDs
          }
        }
      }
    }
    let activeOrdersQuery = {
      $or: [
        { effectiveDate: { $exists: false }, ...ordersQuerybyItemIdAndUser },
        { effectiveDate: { $lte: date }, ...ordersQuerybyItemIdAndUser }
      ]
    }
    return getOrders(activeOrdersQuery)
  }
  return {
    config,
    saveOrder,
    getOrders,
    removeOrder,
    makeOrderEffective,
    getItemsActiveOrders
  }
}