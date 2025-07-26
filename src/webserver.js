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

const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
require('dotenv').config() // Load environment variables from .env file

// Load configuration from YAML file
const configPath = path.join(__dirname, '../config.yml')
const config = yaml.load(fs.readFileSync(configPath, 'utf8'))

const express = require('express')
const WebServer = express()
const logger = require('./logger')
const middleware = require('./middleware')
const routes = require('./routes')
const server = require('http').createServer(WebServer)
let port = process.env.PORT || config.port || 8118

;(app => {
  'use strict'

  // Load Events
  require('./emitter/events')

  module.exports.server = server
  module.exports.app = app
  module.exports.init = async (db, callback, p) => {
    if (p !== undefined) port = p
    middleware(app, db, function (middleware, store) {
      module.exports.sessionStore = store
      routes(app, middleware)

      if (typeof callback === 'function') callback()
    })
  }

  module.exports.listen = (callback, p) => {
    if (!_.isUndefined(p)) port = p

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        logger.error('Address in use, exiting...')
        server.close()
      } else {
        logger.error(err.message)
        throw err
      }
    })

    server.listen(port, '0.0.0.0', () => {
      logger.info('Trevyro is now listening on port: ' + port)

      if (_.isFunction(callback)) return callback()
    })
  }

  module.exports.installServer = function (callback) {
    const router = express.Router()
    const controllers = require('./controllers/index.js')
    const path = require('path')
    const hbs = require('express-hbs')
    const hbsHelpers = require('./helpers/hbs/helpers')
    const bodyParser = require('body-parser')
    const favicon = require('serve-favicon')
    const pkg = require('../package.json')
    const routeMiddleware = require('./middleware/middleware')(app)

    app.set('views', path.join(__dirname, './views/'))
    app.engine(
      'hbs',
      hbs.express3({
        defaultLayout: path.join(__dirname, './views/layout/main.hbs'),
        partialsDir: [path.join(__dirname, './views/partials/')]
      })
    )
    app.set('view engine', 'hbs')
    hbsHelpers.register(hbs.handlebars)

    app.use('/assets', express.static(path.join(__dirname, '../public/uploads/assets')))

    app.use(express.static(path.join(__dirname, '../public')))
    app.use(favicon(path.join(__dirname, '../public/img/favicon.ico')))
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    router.get('/healthz', (req, res) => {
      res.status(200).send('OK')
    })
    router.get('/version', (req, res) => {
      return res.json({ version: pkg.version })
    })

    router.get('/install', controllers.install.index)
    router.post('/install', routeMiddleware.checkOrigin, controllers.install.install)
    router.post('/install/elastictest', routeMiddleware.checkOrigin, controllers.install.elastictest)
    router.post('/install/mongotest', routeMiddleware.checkOrigin, controllers.install.mongotest)
    router.post('/install/existingdb', routeMiddleware.checkOrigin, controllers.install.existingdb)
    router.post('/install/restart', routeMiddleware.checkOrigin, controllers.install.restart)

    app.use('/', router)

    app.use((req, res) => {
      return res.redirect('/install')
    })

    require('socket.io')(server)

    require('./sass/buildsass').buildDefault(err => {
      if (err) {
        logger.error(err)
        return callback(err)
      }

      if (!server.listening) {
        server.listen(port, '0.0.0.0', () => {
          return callback()
        })
      } else {
        return callback()
      }
    })
  }
})(WebServer)
