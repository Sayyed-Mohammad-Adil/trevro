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

const logger = require('./logger')
const async = require('async')
const passportSocketIo = require('passport.socketio')
const cookieparser = require('cookie-parser')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
require('dotenv').config() // Load environment variables from .env file

// Load configuration from YAML file
const configPath = path.join(__dirname, '../config.yml')
const config = yaml.load(fs.readFileSync(configPath, 'utf8'))

// Submodules
const ticketSocket = require('./socketio/ticketSocket')
const chatSocket = require('./socketio/chatSocket')
const notificationSocket = require('./socketio/notificationSocket')
const noticeSocket = require('./socketio/noticeSocket')
const accountsImportSocket = require('./socketio/accountImportSocket')
const backupRestoreSocket = require('./socketio/backupRestoreSocket')
const logsSocket = require('./socketio/logsSocket')

const socketServer = function (ws) {
  'use strict'

  const socketConfig = {
    pingTimeout: process.env.SOCKET_PING_TIMEOUT || config.socket.pingTimeout || 15000,
    pingInterval: process.env.SOCKET_PING_INTERVAL || config.socket.pingInterval || 30000,
    secret: process.env.TOKENS_SECRET || config.tokens.secret || 'trevyro$1234#SessionKeY!2288'
  }

  const io = require('socket.io')(ws.server, {
    pingTimeout: socketConfig.pingTimeout,
    pingInterval: socketConfig.pingInterval
  })

  io.use(function (data, accept) {
    async.waterfall(
      [
        async.constant(data),
        function (data, next) {
          if (!data.request._query.token) {
            return next(null, data)
          }

          const userSchema = require('./models/user')
          userSchema.getUserByAccessToken(data.request._query.token, (err, user) => {
            if (!err && user) {
              logger.debug('Authenticated socket ' + data.id + ' - ' + user.username)
              data.request.user = user
              data.request.user.logged_in = true
              data.token = data.request._query.token
              return next(null, data)
            }

            data.emit('unauthorized')
            data.disconnect('Unauthorized')
            return next(new Error('Unauthorized'))
          })
        },
        function (data, accept) {
          if (data.request && data.request.user && data.request.user.logged_in) {
            data.user = data.request.user
            return accept(null, true)
          }

          return passportSocketIo.authorize({
            cookieParser: cookieparser,
            key: 'connect.sid',
            store: ws.sessionStore,
            secret: socketConfig.secret,
            success: onAuthorizeSuccess
          })(data, accept)
        }
      ],
      function (err) {
        if (err) {
          return accept(new Error(err))
        }

        return accept()
      }
    )
  })

  // io.set('transports', ['polling', 'websocket'])

  io.sockets.on('connection', socket => {
    // Register Submodules
    ticketSocket.register(socket)
    chatSocket.register(socket)
    notificationSocket.register(socket)
    noticeSocket.register(socket)
    accountsImportSocket.register(socket)
    backupRestoreSocket.register(socket)
    logsSocket.register(socket)
  })

  global.io = io

  // Register Event Loop
  global.socketServer = {
    eventLoop: {
      _loop: 0,
      start: () => {
        global.socketServer.eventLoop._loop = setInterval(() => {
          // The main socket event loop.
          notificationSocket.eventLoop()
          chatSocket.eventLoop()
        }, 5000)
      },
      stop: () => {
        clearInterval(global.socketServer.eventLoop._loop)
      }
    }
  }

  global.socketServer.eventLoop.start()

  logger.info('SocketServer Running')
}

function onAuthorizeSuccess (data, accept) {
  logger.debug('User successfully connected: ' + data.user.username)

  accept()
}

module.exports = socketServer
