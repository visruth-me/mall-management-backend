const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

const models = {
  admin: require('../models/admin'),
  customer: require('../models/customer'),
  employee: require('../models/employee'),
  tenant: require('../models/tenant')
}

loginRouter.post('/', async (request, response) => {
  const { type, username, password } = request.body

  const User = models[type]
  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
    type: type
  }

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  response
    .status(200)
    .send({ token, username: user.username, name: user.name, type: type })
})

module.exports = loginRouter
