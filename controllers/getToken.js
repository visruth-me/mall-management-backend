const jwt = require('jsonwebtoken')

const getUserIdFromToken = (req) => {
  const authHeader = req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('token missing')
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.SECRET)
    return decoded.id
  } catch {
    throw new Error('token invalid')
  }
}

module.exports= { getUserIdFromToken }