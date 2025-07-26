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

const logger = require('winston')
const utils = require('../helpers/utils')
const noticeSchema = require('../models/notice')

const socketEventConst = require('../socketio/socketEventConsts')

const events = {}

function register (socket) {
  events.onShowNotice(socket)
  events.onClearNotice(socket)
}

function eventLoop () {}

events.onShowNotice = function (socket) {
  socket.on(socketEventConst.NOTICE_SHOW, function ({ noticeId }) {
    noticeSchema.getNotice(noticeId, function (err, notice) {
      if (err) return true
      notice.activeDate = new Date()
      notice.save(function (err) {
        if (err) {
          logger.warn(err)
          return true
        }

        utils.sendToAllConnectedClients(io, socketEventConst.NOTICE_UI_SHOW, notice)
      })
    })
  })
}

events.onClearNotice = function (socket) {
  socket.on(socketEventConst.NOTICE_CLEAR, function () {
    utils.sendToAllConnectedClients(io, socketEventConst.NOTICE_UI_CLEAR)
  })
}

module.exports = {
  events: events,
  eventLoop: eventLoop,
  register: register
}
