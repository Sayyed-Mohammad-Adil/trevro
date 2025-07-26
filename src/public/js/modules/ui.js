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

define('modules/ui', [
  'serverSocket/socketEventConsts',
  'jquery',
  'lodash',
  'uikit',
  'modules/helpers',
  'history'
], function (socketEvents, $, _, UIKit, helpers) {
  const socketUi = {}

  let socket

  socketUi.init = function (sock) {
    socketUi.socket = socket = sock

    this.flushRoles()

    // Events
    this.onProfileImageUpdate()
  }

  socketUi.fetchServerLogs = function () {
    socket.emit('logs:fetch')
  }

  socketUi.flushRoles = function () {
    socket.removeAllListeners(socketEvents.ROLES_FLUSH)
    socket.on(socketEvents.ROLES_FLUSH, function () {
      helpers.flushRoles()
    })
  }

  socketUi.onProfileImageUpdate = function () {
    socket.removeAllListeners('trevyro:profileImageUpdate')
    socket.on('trevyro:profileImageUpdate', function (data) {
      var profileImage = $('#profileImage[data-userid="' + data.userid + '"]')
      if (profileImage.length > 0) {
        profileImage.attr('src', '/uploads/users/' + data.img + '?r=' + new Date().getTime())
      }
    })
  }

  return socketUi
})
