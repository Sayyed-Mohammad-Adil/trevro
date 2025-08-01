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
const permissions = require('../permissions')
const settingsUtil = require('../settings/settingsUtil')

const settingsController = {}

settingsController.content = {}

function initViewContent (view, req) {
  const content = {}
  content.title = 'Settings'
  content.nav = 'settings'
  content.subnav = 'settings-' + view

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata

  return content
}

function checkPerms (req, role) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, role)) {
    req.flash('message', 'Permission Denied.')

    return false
  }

  return true
}

function handleError (res, err) {
  if (err) {
    return res.render('error', {
      layout: false,
      error: err,
      message: err.message
    })
  }
}

function renderView (res, content) {
  settingsUtil.getSettings(function (err, returnedContent) {
    if (err) return handleError(res, err)

    content.data.settings = returnedContent.data.settings
    content.data.ticketTypes = returnedContent.data.ticketTypes
    content.data.priorities = returnedContent.data.priorities
    content.data.mailTemplates = returnedContent.data.mailTemplates
    content.data.tags = returnedContent.data.tags
    content.data.status = returnedContent.data.status

    return res.render('settings', content)
  })
}

settingsController.general = function (req, res) {
  if (!checkPerms(req, 'settings:view')) return res.redirect('/')

  const content = initViewContent('general', req)

  renderView(res, content)
}

settingsController.accounts = function (req, res) {
  if (!checkPerms(req, 'settings:view')) return res.redirect('/')

  const content = initViewContent('accounts', req)

  renderView(res, content)
}

settingsController.appearance = function (req, res) {
  if (!checkPerms(req, 'settings:view')) return res.redirect('/')

  const content = initViewContent('appearance', req)

  renderView(res, content)
}

settingsController.ticketSettings = function (req, res) {
  if (!checkPerms(req, 'settings:tickets')) return res.redirect('/settings')

  const content = initViewContent('tickets', req)

  renderView(res, content)
}

settingsController.mailerSettings = function (req, res) {
  if (!checkPerms(req, 'settings:mailer')) return res.redirect('/settings')

  const content = initViewContent('mailer', req)

  renderView(res, content)
}

settingsController.permissionsSettings = function (req, res) {
  if (!checkPerms(req, 'settings:permissions')) return res.redirect('/settings')

  const content = initViewContent('permissions', req)

  renderView(res, content)
}

settingsController.notificationsSettings = function (req, res) {
  if (!checkPerms(req, 'settings:notifications')) return res.redirect('/settings')

  const content = initViewContent('notifications', req)

  renderView(res, content)
}

settingsController.elasticsearchSettings = function (req, res) {
  if (!checkPerms(req, 'settings:elasticsearch')) return res.redirect('/settings')

  const content = initViewContent('elasticsearch', req)

  renderView(res, content)
}

settingsController.tpsSettings = function (req, res) {
  if (!checkPerms(req, 'settings:tps')) return res.redirect('/settings')

  const content = initViewContent('tps', req)

  renderView(res, content)
}

settingsController.backupSettings = function (req, res) {
  if (!checkPerms(req, 'settings:backup')) return res.redirect('/settings')

  const content = initViewContent('backup', req)

  renderView(res, content)
}

settingsController.serverSettings = function (req, res) {
  const content = initViewContent('server', req)

  renderView(res, content)
}

settingsController.legal = function (req, res) {
  if (!checkPerms(req, 'settings:legal')) return res.redirect('/settings')

  const content = initViewContent('legal', req)

  renderView(res, content)
}

settingsController.logs = function (req, res) {
  if (!checkPerms(req, 'settings:logs')) return res.redirect('/settings')

  const content = initViewContent('logs', req)

  const fs = require('fs')

  const path = require('path')

  const AnsiUp = require('ansi_up')

  const ansiUp = new AnsiUp.default()

  const file = path.join(__dirname, '../../logs/output.log')

  fs.readFile(file, 'utf-8', function (err, data) {
    if (err) {
      content.data.logFileContent = err
      return res.render('logs', content)
    }

    content.data.logFileContent = data.toString().trim()
    content.data.logFileContent = ansiUp.ansi_to_html(content.data.logFileContent)

    return res.render('logs', content)
  })
}

module.exports = settingsController
