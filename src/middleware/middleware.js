/*
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ooooooooooooo                                                                 
 ≡  8'   888   `8                                                                 
 ≡       888      oooo d8b  .ooooo.  oooo    ooo oooo    ooo oooo d8b  .ooooo.    
 ≡       888      `888""8P d88' `88b  `88.  .8'   `88.  .8'  `888""8P d88' `88b   
 ≡       888       888     888ooo888   `88..8'     `88..8'    888     888   888   
 ≡       888       888     888    .o    `888'       `888'     888     888   888   
 ≡      o888o     d888b    `Y8bod8P'     `8'         .8'     d888b    `Y8bod8P'   
 ≡                                               .o..P'                           
 ≡                                               `Y8P'                            
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ≡≡≡≡≡≡≡≡ ⟦ Author   ⟧  Sayyed Mohammad Adil ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 
 ≡  ≡≡≡≡≡≡≡≡ ⟦ Updated  ⟧  01/04/2025 • 00:00:00 AM ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡ 
 ≡  ≡≡≡≡≡≡≡≡ ⟦ License  ⟧  Copyright © 2025–2026. All rights reserved. ≡≡≡≡≡≡≡≡≡ 
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 */

'use strict'

var _ = require('lodash')
var db = require('../database')
var mongoose = require('mongoose')
var logger = require('../logger')
const csrf = require('../dependencies/csrf-td')
const viewdata = require('../helpers/viewdata')

var middleware = {}

middleware.db = function (req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    logger.warn('MongoDB ReadyState = ' + mongoose.connection.readyState)
    db.init(function (e, database) {
      if (e) {
        return res.status(503).send()
      }

      req.db = database
    })
  }

  return next()
}

middleware.redirectToDashboardIfLoggedIn = function (req, res, next) {
  if (req.user) {
    if (req.user.hasL2Auth) {
      return middleware.ensurel2Auth(req, res, next)
    }

    if (!req.user.role.isAdmin || !req.user.role.isAgent) {
      return res.redirect('/tickets')
    }

    return res.redirect('/dashboard')
  }

  return next()
}

middleware.redirectToLogin = function (req, res, next) {
  if (!req.user) {
    if (!_.isUndefined(req.session)) {
      req.session.redirectUrl = req.url
    }

    return res.redirect('/')
  }

  if (req.user.deleted) {
    req.logout()
    req.session.l2auth = null
    req.session.destroy()
    return res.redirect('/')
  }

  if (req.user.hasL2Auth) {
    if (req.session.l2auth !== 'totp') {
      return res.redirect('/')
    }
  }

  return next()
}

middleware.redirectIfUser = function (req, res, next) {
  if (!req.user) {
    if (!_.isUndefined(req.session)) {
      res.session.redirectUrl = req.url
    }

    return res.redirect('/')
  }

  if (!req.user.role.isAdmin && !req.user.role.isAgent) {
    return res.redirect(301, '/tickets')
  }

  return next()
}

middleware.ensurel2Auth = function (req, res, next) {
  if (req.session.l2auth === 'totp') {
    if (req.user) {
      if (req.user.role !== 'user') {
        return res.redirect('/dashboard')
      }

      return res.redirect('/tickets')
    }

    return next()
  }

  return res.redirect('/l2auth')
}

// Common
middleware.loadCommonData = function (req, res, next) {
  viewdata.getData(req, function (data) {
    data.csrfToken = req.csrfToken
    req.viewdata = data

    return next()
  })
}

middleware.cache = function (seconds) {
  return function (req, res, next) {
    res.setHeader('Cache-Control', 'public, max-age=' + seconds)

    next()
  }
}

middleware.checkCaptcha = function (req, res, next) {
  var postData = req.body
  if (postData === undefined) {
    return res.status(400).json({ success: false, error: 'Invalid Captcha' })
  }

  var captcha = postData.captcha
  var captchaValue = req.session.captcha

  if (captchaValue === undefined) {
    return res.status(400).json({ success: false, error: 'Invalid Captcha' })
  }

  if (captchaValue.toString() !== captcha.toString()) {
    return res.status(400).json({ success: false, error: 'Invalid Captcha' })
  }

  return next()
}

middleware.checkOrigin = function (req, res, next) {
  var origin = req.headers.origin
  var host = req.headers.host

  // Firefox Hack - Firefox Bug 1341689 & 1424076
  // Trevyro Bug #26
  // TODO: Fix this once Firefox fixes its Origin Header in same-origin POST request.
  if (!origin) {
    origin = host
  }

  origin = origin.replace(/^https?:\/\//, '')

  if (origin !== host) {
    return res.status(400).json({ success: false, error: 'Invalid Origin!' })
  }

  return next()
}

// API
middleware.api = function (req, res, next) {
  var accessToken = req.headers.accesstoken

  var userSchema = require('../models/user')

  if (_.isUndefined(accessToken) || _.isNull(accessToken)) {
    var user = req.user
    if (_.isUndefined(user) || _.isNull(user)) return res.status(401).json({ error: 'Invalid Access Token' })

    return next()
  }

  userSchema.getUserByAccessToken(accessToken, function (err, user) {
    if (err) return res.status(401).json({ error: err.message })
    if (!user) return res.status(401).json({ error: 'Invalid Access Token' })

    req.user = user

    return next()
  })
}

middleware.hasAuth = middleware.api

middleware.apiv2 = function (req, res, next) {
  // ByPass auth for now if user is set through session
  if (req.user) return next()

  var passport = require('passport')
  passport.authenticate('jwt', { session: true }, function (err, user) {
    if (err || !user) return res.status(401).json({ success: false, error: 'Invalid Authentication Token' })
    if (user) {
      req.user = user
      return next()
    }

    return res.status(500).json({ success: false, error: 'Unknown Error Occurred' })
  })(req, res, next)
}

middleware.canUser = function (action) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not Authorized for this API call.' })
    const permissions = require('../permissions')
    const perm = permissions.canThis(req.user.role, action)
    if (perm) return next()

    return res.status(401).json({ success: false, error: 'Not Authorized for this API call.' })
  }
}

middleware.isAdmin = function (req, res, next) {
  var roles = global.roles
  var role = _.find(roles, { _id: req.user.role._id })
  role.isAdmin = role.grants.indexOf('admin:*') !== -1

  if (role.isAdmin) return next()

  return res.status(401).json({ success: false, error: 'Not Authorized for this API call.' })
}

middleware.isAgentOrAdmin = function (req, res, next) {
  var role = _.find(global.roles, { _id: req.user.role._id })
  role.isAdmin = role.grants.indexOf('admin:*') !== -1
  role.isAgent = role.grants.indexOf('agent:*') !== -1

  if (role.isAgent || role.isAdmin) return next()

  return res.status(401).json({ success: false, error: 'Not Authorized for this API call.' })
}

middleware.isAgent = function (req, res, next) {
  var role = _.find(global.roles, { _id: req.user.role._id })
  role.isAgent = role.grants.indexOf('agent:*') !== -1

  if (role.isAgent) return next()

  return res.status(401).json({ success: false, error: 'Not Authorized for this API call.' })
}

middleware.isSupport = middleware.isAgent

middleware.csrfCheck = function (req, res, next) {
  csrf.init()
  return csrf.middleware(req, res, next)
}

module.exports = function () {
  return middleware
}
