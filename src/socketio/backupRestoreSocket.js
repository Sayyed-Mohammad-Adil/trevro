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

const utils = require('../helpers/utils')
const sharedVars = require('./index').shared
const socketEvents = require('./socketEventConsts')

const events = {}

function register (socket) {
  events.showRestoreOverlay(socket)
  events.emitRestoreComplete(socket)
}

events.showRestoreOverlay = function (socket) {
  socket.on(socketEvents.BACKUP_RESTORE_SHOW_OVERLAY, function () {
    if (global.socketServer && global.socketServer.eventLoop) {
      global.socketServer.eventLoop.stop()
    }

    utils.sendToAllConnectedClients(io, socketEvents.BACKUP_RESTORE_UI_SHOW_OVERLAY)
  })
}

events.emitRestoreComplete = function (socket) {
  socket.on(socketEvents.BACKUP_RESTORE_COMPLETE, function () {
    utils.sendToAllConnectedClients(io, socketEvents.BACKUP_RESTORE_UI_COMPLETE)
    utils.disconnectAllClients(io)
    sharedVars.sockets = []
    sharedVars.usersOnline = {}
    sharedVars.idleUsers = {}
  })
}

module.exports = {
  events: events,
  register: register
}
