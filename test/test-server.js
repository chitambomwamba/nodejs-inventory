const app = require('express')()
const bodyParser = require('body-parser')
const NodejsInventory = require('../index.js')

const Inventory = new NodejsInventory({ i: 1, n: 2 })

Inventory.connect(process.env.DB || 'localhost:27017/nodejs-inventory-test')
Inventory.startMonitor()

app.use(bodyParser.json())

app.use((req, res, next) => {
  req.user = {
    _id: req.headers.user
  }
  req.query.user = req.user
  next()
})
app.use('/', Inventory.allRoutes)

app.listen(process.env.PORT || 8000)

module.exports = app
