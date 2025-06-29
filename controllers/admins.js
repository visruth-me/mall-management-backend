const adminRouter = require('express').Router()
const Admin = require('../models/admin')

adminRouter.get('/', async (request, response) => {
  try {
    const admins = await Admin.find({})
    response.json(admins)
  } catch (error) {
    console.error('Failed to fetch admins', error)
    response.status(500).json({ error: 'Failed to fetch admins' })
  }
})

adminRouter.get('/:id', async (request, response) => {
  try {
    const admin = await Admin.findById(request.params.id)
    if(!admin) {
      return response.status(404).json({ error: 'Admin not found' })
    }
    response.json(admin)
  } catch (error) {
    console.error('Failed to fetch admin info', error)
    response.status(500).json({ error: 'Failed to fetch admin info' })
  }
})

module.exports = adminRouter