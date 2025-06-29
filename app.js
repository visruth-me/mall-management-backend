const express = require ('express')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const shopsRouter = require('./controllers/shops')
const discountRouter = require('./controllers/discounts')
const feedbackRouter = require('./controllers/feedbacks')
const serviceRouter = require('./controllers/services')

const app = express()

logger.info('connecting to',config.MONGODB_URI)

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MONGODB')
  })
  .catch((error) => {
    logger.error('error connection to MONGODB:',error.message)
  })

app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use('/api/discounts',discountRouter)
app.use('/api/shops',shopsRouter)
app.use('/api/feedbacks',feedbackRouter)
app.use('/api/services',serviceRouter)
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app