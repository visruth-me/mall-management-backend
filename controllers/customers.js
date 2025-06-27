const customerRouter = require('express').Router()
const bcrypt = require('bcrypt')
const Customer = require('../models/customer')

customerRouter.get('/', async (request, response) => {
  try {
    const customers = await Customer.find({})
    response.json(customers)
  } catch {
    response.status(500).json({ error: 'Failed to fetch customers' })
  }
})

customerRouter.get('/:id', async (request, response) => {
  try {
    const customer = await Customer.findById(request.params.id)
    if(!customer){
      return response.status(404).json({ error: 'Customer not found' })
    }
    response.json(customer)
  } catch {
    response.status(500).json({ error: 'Failed to fetch customer info' })
  }
})

customerRouter.put('/')

module.exports = customerRouter