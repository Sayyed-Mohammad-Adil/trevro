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
// Removed nconf import
const jsStringEscape = require('js-string-escape')
const settingSchema = require('../models/setting')
const ticketTypeSchema = require('../models/tickettype')
const roleSchema = require('../models/role')
const roleOrderSchema = require('../models/roleorder')
const statusSchema = require('../models/ticketStatus')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
require('dotenv').config() // Load environment variables from .env file

// Load configuration from YAML file
const configPath = path.join(__dirname, '../../config.yml')
const config = yaml.load(fs.readFileSync(configPath, 'utf8'))
const util = {}

function parseSetting (settings, name, defaultValue) {
  let s = _.find(settings, function (x) {
    return x.name === name
  })
  s = _.isUndefined(s) ? { value: defaultValue } : s

  return s
}

util.setSetting = function (setting, value, callback) {
  const s = {
    name: setting,
    value: value
  }

  settingSchema.updateOne({ name: s.name }, s, { upsert: true }, callback)
}

util.getSettings = async callback => {
  return new Promise((resolve, reject) => {
    ;(async () => {
      try {
        const settings = await settingSchema.getSettings()
        const s = {}
        const content = { data: {} }

        s.emailBeta = parseSetting(settings, 'beta:email', false)
        s.hasThirdParty = process.env.THIRD_PARTY_ENABLE || config.thirdParty.enable || false

        s.siteTitle = parseSetting(settings, 'gen:sitetitle', 'Trevyro')
        s.siteUrl = parseSetting(settings, 'gen:siteurl', '')
        s.timezone = parseSetting(settings, 'gen:timezone', 'America/New_York')
        s.timeFormat = parseSetting(settings, 'gen:timeFormat', 'hh:mma')
        s.shortDateFormat = parseSetting(settings, 'gen:shortDateFormat', 'MM/DD/YYYY')
        s.longDateFormat = parseSetting(settings, 'gen:longDateFormat', 'MMM DD, YYYY')

        s.hasCustomLogo = parseSetting(settings, 'gen:customlogo', false)
        s.customLogoFilename = parseSetting(settings, 'gen:customlogofilename', '')
        s.hasCustomPageLogo = parseSetting(settings, 'gen:custompagelogo', false)
        s.customPageLogoFilename = parseSetting(settings, 'gen:custompagelogofilename', '')
        s.hasCustomFavicon = parseSetting(settings, 'gen:customfavicon', false)
        s.customFaviconFilename = parseSetting(settings, 'gen:customfaviconfilename', '')

        s.colorHeaderBG = parseSetting(settings, 'color:headerbg', '#42464d')
        s.colorHeaderPrimary = parseSetting(settings, 'color:headerprimary', '#f6f7fa')
        s.colorPrimary = parseSetting(settings, 'color:primary', '#545A63')
        s.colorSecondary = parseSetting(settings, 'color:secondary', '#f7f8fa')
        s.colorTertiary = parseSetting(settings, 'color:tertiary', '#E74C3C')
        s.colorQuaternary = parseSetting(settings, 'color:quaternary', '#E6E7E8')

        s.defaultTicketType = parseSetting(settings, 'ticket:type:default', '')
        s.minSubjectLength = parseSetting(settings, 'ticket:minlength:subject', 10)
        s.minIssueLength = parseSetting(settings, 'ticket:minlength:issue', 10)

        s.defaultUserRole = parseSetting(settings, 'role:user:default', '')

        s.mailerEnabled = parseSetting(settings, 'mailer:enable', false)
        s.mailerHost = parseSetting(settings, 'mailer:host', '')
        s.mailerSSL = parseSetting(settings, 'mailer:ssl', false)
        s.mailerPort = parseSetting(settings, 'mailer:port', 25)
        s.mailerUsername = parseSetting(settings, 'mailer:username', '')
        s.mailerPassword = parseSetting(settings, 'mailer:password', '')
        s.mailerFrom = parseSetting(settings, 'mailer:from', '')

        s.mailerCheckEnabled = parseSetting(settings, 'mailer:check:enable', false)
        s.mailerCheckPolling = parseSetting(settings, 'mailer:check:polling', 600000)
        s.mailerCheckHost = parseSetting(settings, 'mailer:check:host', '')
        s.mailerCheckPort = parseSetting(settings, 'mailer:check:port', 143)
        s.mailerCheckUsername = parseSetting(settings, 'mailer:check:username', '')
        s.mailerCheckPassword = parseSetting(settings, 'mailer:check:password', '')
        s.mailerCheckSelfSign = parseSetting(settings, 'mailer:check:selfsign', false)
        s.mailerCheckTicketType = parseSetting(settings, 'mailer:check:ticketype', '')
        s.mailerCheckTicketPriority = parseSetting(settings, 'mailer:check:ticketpriority', '')
        s.mailerCheckCreateAccount = parseSetting(settings, 'mailer:check:createaccount', false)
        s.mailerCheckDeleteMessage = parseSetting(settings, 'mailer:check:deletemessage', true)

        s.showTour = parseSetting(settings, 'showTour:enable', false)
        s.showOverdueTickets = parseSetting(settings, 'showOverdueTickets:enable', true)

        // Elasticsearch
        s.elasticSearchEnabled = parseSetting(settings, 'es:enable', false)
        s.elasticSearchHost = parseSetting(settings, 'es:host', '')
        s.elasticSearchPort = parseSetting(settings, 'es:port', 9200)
        s.elasticSearchConfigured = {
          value: s.elasticSearchEnabled.value === true && !_.isEmpty(s.elasticSearchHost.value)
        }

        s.tpsEnabled = parseSetting(settings, 'tps:enable', false)
        s.tpsUsername = parseSetting(settings, 'tps:username', '')
        s.tpsApiKey = parseSetting(settings, 'tps:apikey', '')

        s.allowAgentUserTickets = parseSetting(settings, 'allowAgentUserTickets:enable', false)
        s.allowPublicTickets = parseSetting(settings, 'allowPublicTickets:enable', false)
        s.allowUserRegistration = parseSetting(settings, 'allowUserRegistration:enable', false)
        s.playNewTicketSound = parseSetting(settings, 'playNewTicketSound:enable', true)

        s.privacyPolicy = parseSetting(settings, 'legal:privacypolicy', ' ')
        s.privacyPolicy.value = jsStringEscape(s.privacyPolicy.value)

        s.maintenanceMode = parseSetting(settings, 'maintenanceMode:enable', false)

        s.accountsPasswordComplexity = parseSetting(settings, 'accountsPasswordComplexity:enable', true)

        const types = await ticketTypeSchema.getTypes()
        content.data.ticketTypes = _.sortBy(types, o => o.name)

        _.each(content.data.ticketTypes, type => {
          type.priorities = _.sortBy(type.priorities, ['migrationNum', 'name'])
        })

        const ticketPrioritySchema = require('../models/ticketpriority')
        const priorities = await ticketPrioritySchema.getPriorities()
        content.data.priorities = _.sortBy(priorities, ['migrationNum', 'name'])

        const status = await statusSchema.getStatus()
        content.data.status = _.sortBy(status, 'order')

        const templateSchema = require('../models/template')
        const templates = await templateSchema.find({})
        content.data.mailTemplates = _.sortBy(templates, 'name')

        const tagSchema = require('../models/tag')
        const tagCount = await tagSchema.getTagCount()
        content.data.tags = { count: tagCount }

        const roles = await roleSchema.getRoles()
        let roleOrder = await roleOrderSchema.getOrder()
        roleOrder = roleOrder.order

        if (roleOrder.length > 0) {
          content.data.roles = _.map(roleOrder, roID => {
            return _.find(roles, { _id: roID })
          })
        } else content.data.roles = roles

        content.data.settings = s

        if (typeof callback === 'function') callback(null, content)

        return resolve(content)
      } catch (e) {
        if (typeof callback === 'function') callback(e)

        return reject(e)
      }
    })()
  })
}

module.exports = util
