const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app') // your Express app
const Feedback = require('../models/feedback')
const Shop = require('../models/shop')

const api = supertest(app)

process.env.SECRET = process.env.SECRET || 'testsecret'

describe('Feedback API tests', () => {
  let shopId

  beforeEach(async () => {
    // Clear DB collections
    await Feedback.deleteMany({})
    await Shop.deleteMany({})

    // Create a shop for feedbacks
    const shop = new Shop({
      name: 'TestShop',
      category: 'Food',
      tenantID: new mongoose.Types.ObjectId(),
      description: 'A test shop',
      location: '123 Test St',
      email: 'testshop@example.com',
      phone: '1234567890'
    })
    const savedShop = await shop.save()
    shopId = savedShop._id.toString()

  })

  test('GET /api/feedbacks returns empty array initially', async () => {
    const res = await api
      .get('/api/feedbacks')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(Array.isArray(res.body))
    assert.strictEqual(res.body.length, 0)
  })

  test('POST /api/feedbacks creates feedback successfully', async () => {
    const newFeedback = {
      shopID: shopId,
      rating: 4,
      description: 'Great service',
      customerID: 'customer123'
    }

    const res = await api
      .post('/api/feedbacks')
      .send(newFeedback)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.message, 'Feedback created')
    assert.strictEqual(res.body.feedback.rating, 4)
    assert.strictEqual(res.body.feedback.description, 'Great service')
    assert.strictEqual(res.body.feedback.customerID, 'customer123')
  })

  test('POST /api/feedbacks fails with missing rating', async () => {
    const newFeedback = {
      shopID: shopId,
      description: 'Missing rating'
    }

    await api
      .post('/api/feedbacks')
      .send(newFeedback)
      .expect(400)
  })

  test('GET /api/feedbacks/shop/:shopID returns feedbacks for that shop', async () => {
    // Add a feedback first
    const feedback = new Feedback({
      shopID: shopId,
      rating: 5,
      description: 'Excellent!',
      customerID: 'cust1'
    })
    await feedback.save()

    const res = await api
      .get(`/api/feedbacks/shop/${shopId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(Array.isArray(res.body))
    assert(res.body.length > 0)
    assert.strictEqual(res.body[0].description, 'Excellent!')
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
