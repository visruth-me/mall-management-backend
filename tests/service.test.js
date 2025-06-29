const { test, beforeEach, after, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')
const Service = require('../models/service')

const api = supertest(app)

describe('service API tests', () => {
  let serviceId

  beforeEach(async () => {
    await Service.deleteMany({})

    const initialService = new Service({
      name: 'Cleaning',
      description: 'Basic cleaning service',
      isAvailable: true
    })
    const savedService = await initialService.save()
    serviceId = savedService._id.toString()
  })

  test('GET /api/services returns only available services', async () => {
    const response = await api
      .get('/api/services')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].name, 'Cleaning')
  })

  test('GET /api/services/all returns all services', async () => {
    const response = await api
      .get('/api/services/all')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.length, 1)
    assert.strictEqual(response.body[0].description, 'Basic cleaning service')
  })

  test('POST /api/services creates a new service', async () => {
    const newService = {
      name: 'Maintenance',
      description: 'Electrical maintenance'
    }

    await api
      .post('/api/services')
      .send(newService)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const services = await Service.find({})
    assert.strictEqual(services.length, 2)
    assert(services.some(s => s.name === 'Maintenance'))
  })

  test('POST /api/services fails if name or description missing', async () => {
    const invalidService = { name: 'Incomplete' }

    const response = await api
      .post('/api/services')
      .send(invalidService)
      .expect(400)

    assert.strictEqual(response.body.error, 'Name and description are required')
  })

  test('PUT /api/services/:id updates isAvailable status', async () => {
    const response = await api
      .put(`/api/services/${serviceId}`)
      .send({ isAvailable: false })
      .expect(200)

    assert.strictEqual(response.body.isAvailable, false)

    const updated = await Service.findById(serviceId)
    assert.strictEqual(updated.isAvailable, false)
  })

  test('PUT /api/services/:id returns 404 for unknown id', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const response = await api
      .put(`/api/services/${fakeId}`)
      .send({ isAvailable: false })
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})
