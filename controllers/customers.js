const customerRouter = require('express').Router()
const bcrypt = require('bcrypt')
const Customer = require('../models/customer')

customerRouter.get('/', async (request, response) => {
  try {
    const customers = await Customer.find({})
    response.json(customers)
  } catch (error) {
    console.error('Failed to fetch customers', error)
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
  } catch (error) {
    console.error('Failed to fetch customer info', error)
    response.status(500).json({ error: 'Failed to fetch customer info' })
  }
})

customerRouter.put('/:id', async (request, response) => {
  try {
    const { password, ...rest } = request.body
    const update = { ...rest }

    if (password) {
      const saltRounds = 10
      update.passwordHash = await bcrypt.hash(password, saltRounds)
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      request.params.id,
      update,
      { new: true, runValidators: true, context: 'query' }
    )

    if (!updatedCustomer) {
      return response.status(404).json({ error: 'Customer not found' })
    }

    response.json(updatedCustomer)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

customerRouter.post('/', async (request, response) => {
  try {
    const { username, name, email, phone, password } = request.body
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const customer = new Customer({
      username,
      name,
      email,
      phone,
      passwordHash,
    })

    const savedCustomer = await customer.save()

    response.status(201).json(savedCustomer)
  } catch (error){
    console.error('Failed to save customer', error)
    response.status(500).json({ error: 'Failed to save customer' })
  }
})

module.exports = customerRouter