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

define('pages/plugins', ['jquery', 'modules/helpers', 'tether', 'history'], function ($, helpers, Tether) {
  var pluginsPage = {}

  pluginsPage.init = function (callback) {
    $(document).ready(function () {
      var $searchPluginList = $('#search_plugin_list')
      $searchPluginList.off('keyup')
      $searchPluginList.on('keyup', function () {
        var value = this.value.toLowerCase()
        $('table#plugin_list_table')
          .find('tbody')
          .find('tr')
          .each(function () {
            var id = $(this)
              .find('td')
              .text()
              .toLowerCase()
            $(this).toggle(id.indexOf(value) !== -1)
          })
      })

      if ($('.plugin-tether').length > 0) {
        // eslint-disable-next-line
        new Tether({
          element: '.plugin-tether',
          target: '.tether-plugins',
          attachment: 'top left',
          targetAttachment: 'top right',
          offset: '0 -20px'
        })
      }

      if (typeof callback === 'function') {
        return callback()
      }
    })
  }

  return pluginsPage
})
