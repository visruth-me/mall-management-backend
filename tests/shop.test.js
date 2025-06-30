const Shop = require('../models/shop')
const { test,after,beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const app = require('../app')

const api = supertest(app)

describe('when there is initially one shop in db', () => {
  beforeEach(async () => {
    await Shop.deleteMany({})

    const initialShop = new Shop({
      name: 'ShopOne',
      category: 'Food',
      tenantID: new mongoose.Types.ObjectId(),
      description: 'Test shop',
      location: '1 Mall Street',
      email: 'shopone@example.com',
      phone: '1234567890'
    })

    await initialShop.save()
  })

  test('get all categories', async () => {
    const res = await api
      .get('/api/shops/categories')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(res.body.includes('Food'))
  })

  test('fetch shop names by category', async () => {
    const res = await api
      .get('/api/shops/names')
      .query({ category: 'Food' })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert(res.body.includes('ShopOne'))
  })

  test('fetch shop info by id', async () => {
    const shop = await Shop.findOne({ name: 'ShopOne' })
    const res = await api
      .get(`/api/shops/${shop.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.name, 'ShopOne')
  })
  test('POST /api/shops successfully creates a shop', async () => {
    const newShop = {
      name: 'Green Mart',
      category: 'Electronics',
      tenantID: new mongoose.Types.ObjectId().toString(),
      description: 'A store for fresh vegetables and fruits.',
      location: 'Block A, Main Market Street',
      email: 'greenmart@example.com',
      phone: '9876543210'
    }

    const res = await api
      .post('/api/shops')
      .send(newShop)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(res.body.name, newShop.name)
    assert.strictEqual(res.body.category, newShop.category)

    const addedShop = await Shop.findOne({ name: newShop.name })
    assert(addedShop)
    assert.strictEqual(addedShop.phone, newShop.phone)
  })

  test('POST /api/shops fails with 400 if data is invalid', async () => {
    const invalidShop = {
      name: 'Incomplete Shop'
      // missing required fields like tenantID, category, etc.
    }

    await api
      .post('/api/shops')
      .send(invalidShop)
      .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})