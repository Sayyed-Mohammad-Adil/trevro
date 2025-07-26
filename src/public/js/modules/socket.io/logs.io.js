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

define('modules/socket.io/logs.io', ['jquery', 'underscore', 'moment', 'modules/helpers', 'history'], function (
  $,
  _,
  moment,
  helpers
) {
  var logsIO = {}

  cleanPreTags()

  logsIO.getLogData = function (socket) {
    socket.removeAllListeners('logs:data')
    socket.on('logs:data', function (data) {
      var $sLogs = $('#serverlogs')
      if ($sLogs.length > 0) {
        $sLogs.append(data)
        $sLogs.append('\n<br />')
        $sLogs.scrollTop(99999999999999 * 999999999999999)
        helpers.scrollToBottom($sLogs)
      }
    })
  }

  function cleanPreTags () {
    ;[].forEach.call(document.querySelectorAll('pre'), function ($pre) {
      var lines = $($pre)
        .html()
        .split('\n')
      var matches
      for (var i = 0; i < lines.length; i++) {
        var indentation = (matches = /^\s+/.exec(lines[i])) !== null ? matches[0] : null
        if (indentation) {
          // lines = lines.map(function(line) {
          //     return line.replace(indentation, '');
          // });
          lines[i].replace(/^\s+/, '')
        }
      }

      return $($pre).html(lines.join('\n').trim())
    })
  }

  return logsIO
})
