const { Router } = require('express')
const { ValidationError } = require('sequelize')

const bcrypt = require('bcryptjs')
const { generateAuthToken, requireAuthentication } = require('../lib/auth')

const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')
const { User, UserFields} = require('../models/user')
const { type } = require('express/lib/response')

const router = Router()

/*
 * Route to create a new user.
 */
router.post('/', async function (req, res, next) {
  try {
    const user = await User.create(req.body, UserFields)
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }
})

router.post('/login', async function (req, res, next) {
  if (req.body && req.body.email && req.body.password){
    const user = await User.findOne({where: {email: req.body.email}})
    const authenticated = user && await bcrypt.compare(req.body.password, user.password)
    if (authenticated){
      const token = generateAuthToken(user.id)
      res.status(200).send({token: token})
    }else{
      res.status(401).send({
        error: "Invalid credentials"
      })
    }
  }else{
    res.status(400).send({
      error: "Request needs a user"
    })
  }
})


/*
 * Route to fetch info about a specific user.
 */
router.get('/:userId', requireAuthentication, async function (req, res, next) {
  console.log("===req.user:",req.user)
  const user = await User.findByPk(req.user)
  if(req.user != req.params.userId && user.admin != true){
    res.status(403).send({
      err: "Unauthorized access to specified resource"
    })
  }
  else{
    const userId = req.params.userId
    const user = await User.findByPk(userId, {attributes: {exclude: ['password']}})
    console.log("===req.headers:",req.headers)
    if (user) {
      res.status(200).send(user)
    } else {
      next()
    }
  }
 
})

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAuthentication,async function (req, res) {
  console.log("===req.user:",req.user)
  const user = await User.findByPk(req.user)
  if(req.user != req.params.userId && user.admin != true){
    res.status(403).send({
      err: "Unauthorized access to specified resource"
    })
  }
  else{
    const userId = req.params.userId
    const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
    res.status(200).json({
      businesses: userBusinesses
    })
  }
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAuthentication,async function (req, res) {
  console.log("===req.user:",req.user)
  const user = await User.findByPk(req.user)
  if(req.user != req.params.userId && user.admin != true){
    res.status(403).send({
      err: "Unauthorized access to specified resource"
    })
  }
  else{
    const userId = req.params.userId
    const userReviews = await Review.findAll({ where: { userId: userId }})
    res.status(200).json({
      reviews: userReviews
    })
  }
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAuthentication,async function (req, res) {
  console.log("===req.user:",req.user)
  const user = await User.findByPk(req.user)
  if(req.user != req.params.userId && user.admin != true){
    res.status(403).send({
      err: "Unauthorized access to specified resource"
    })
  }
  else{
    const userId = req.params.userId
    const userPhotos = await Photo.findAll({ where: { userId: userId }})
    res.status(200).json({
      photos: userPhotos
    })
  }
})

module.exports = router
