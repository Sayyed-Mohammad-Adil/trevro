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

/* eslint-disable node/exports-style,node/exports-style */

/*
 Permissions for Trevyro. Define Roles / Groups.
 --- group:action action action

 *                              = all permissions for grp
 create                         = create permission for grp
 delete                         = delete permission for grp
 edit                            = edit permission for grp
 editSelf                       = edit Self Created Items
 assignee                       = allowed to be assigned to a ticket
 view                           = view permission for grp

 ticket:attachment              = can add attachment
 ticket:removeAttachment        = can remove attachment
 ticket:viewHistory             = can view ticket history on single page
 ticket:setAssignee             = can set ticket Assignee
 ticket:public                  = can view public created tickets
 ticket:notifications_create    = send notification on ticket created

 notes:                         = Internal Notes on tickets

 plugins:manage                 = user can add/remove Plugins
 */
var roles = {
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Administrators',
    allowedAction: ['*']
  },
  mod: {
    id: 'mod',
    name: 'Moderator',
    description: 'Moderators',
    allowedAction: [
      'mod:*',
      'dashboard:*',
      'ticket:create edit view attachment removeAttachment',
      'comment:*',
      'notes:*',
      'reports:view'
    ]
  },
  support: {
    id: 'support',
    name: 'Support',
    description: 'Support User',
    allowedAction: [
      'ticket:*',
      'dashboard:*',
      'accounts:create edit view delete',
      'comment:editSelf create delete',
      'notes:create view',
      'reports:view',
      'notices:*'
    ]
  },
  user: {
    id: 'user',
    name: 'User',
    description: 'User',
    allowedAction: ['ticket:create editSelf attachment print viewall', 'comment:create editSelf']
  }
}

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = roles
  }
} else {
  window.ROLES = roles
}
