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

var logger = require('winston')
var request = require('request')

module.exports.pushNotification = function (tpsUsername, tpsApiKey, notification) {
  var body = {
    title: notification.title,
    content: notification.content,
    data: {
      hostname: notification.hostname,
      users: notification.data.users
    }
  }

  if (notification.data.ticketId) {
    body.data.ticketId = notification.data.ticketId
  }

  if (notification.data.ticketUid) {
    body.data.ticketUid = notification.data.ticketUid
  }

  request(
    {
      url: 'http://push.trevyro.io/api/pushNotification',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accesstoken: tpsApiKey
      },
      body: JSON.stringify(body)
    },
    function (err, response) {
      if (err) {
        logger.debug(err)
      } else {
        if (response.statusCode === 401) {
          logger.warn('[trevyro:TPS:pushNotification] Error - Invalid API Key and or Username.')
        }
      }
    }
  )
}

module.exports.init = function () {
  // emitter.on('ticket:created', onTicketCreate);
  // emitter.on('notification:count:update', onNotificationCountUpdate);
}

// function onTicketCreate(ticketObj) {
//
// }
//
// function onNotificationCountUpdate(user) {
//
// }
