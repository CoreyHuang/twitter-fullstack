const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Like = db.Like
const Tweet = db.Tweet
const Reply = db.Reply

passport.use(new LocalStrategy(
  { usernameField: 'account', passReqToCallback: true },
  (req, account, password, cb) => {
    User.findOne({ where: { account } }).then(user => {
      if (!user) {
        console.log('no this user')
        return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
      }
      if (!bcrypt.compareSync(password, user.password)) {
        console.log('error password')
        return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
      }
      return cb(null, user)
    })
  }
))


const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

let jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = 'test'

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
  User.findByPk(jwt_payload.id).then(user => {
    if (!user) return next(null, false)
    return next(null, user)
  })
})
passport.use(strategy)



passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [Like,
      { model: Tweet, include: Reply },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }]
  }).then(user => {
    // console.log('user @@@', user)
    return cb(null, user.toJSON())
  })
})

module.exports = passport