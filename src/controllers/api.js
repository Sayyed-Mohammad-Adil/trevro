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

// Sub APIs
const apiTicketsV1 = require('./api/v1/tickets')
const apiTagsV1 = require('./api/v1/tags')
const apiNoticesV1 = require('./api/v1/notices')
const apiUsersV1 = require('./api/v1/users')
const apiMessagesV1 = require('./api/v1/messages')
const apiGroupsV1 = require('./api/v1/groups')
const apiReportsV1 = require('./api/v1/reports')
const apiSettingsV1 = require('./api/v1/settings')
const apiPluginsV1 = require('./api/v1/plugins')

const apiController = {}

apiController.index = function (req, res) {
  return res.json({ supported: ['v1', 'v2'] })
}

apiController.v1 = {}
apiController.v1.common = require('./api/v1/common')
apiController.v1.tickets = apiTicketsV1
apiController.v1.tags = apiTagsV1
apiController.v1.notices = apiNoticesV1
apiController.v1.users = apiUsersV1
apiController.v1.messages = apiMessagesV1
apiController.v1.groups = apiGroupsV1
apiController.v1.reports = apiReportsV1
apiController.v1.settings = apiSettingsV1
apiController.v1.plugins = apiPluginsV1
apiController.v1.roles = require('./api/v1/roles')

apiController.v2 = {}
apiController.v2.common = require('./api/v2/common')
apiController.v2.accounts = require('./api/v2/accounts')
apiController.v2.tickets = require('./api/v2/tickets')
apiController.v2.groups = require('./api/v2/groups')
apiController.v2.teams = require('./api/v2/teams')
apiController.v2.departments = require('./api/v2/departments')
apiController.v2.notices = require('./api/v2/notices')
apiController.v2.elasticsearch = require('./api/v2/elasticsearch')
apiController.v2.mailer = require('./api/v2/mailer')
apiController.v2.messages = require('./api/v2/messages')

module.exports = apiController
