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
const nodeMailer = require('nodemailer')

const settings = require('../models/setting')

const mailer = {}


mailer.sendMail = function (data, callback) {
  createTransporter(function (err, mailSettings) {
    if (err) return callback(err)
    if (!mailSettings || !mailSettings.enabled) {
      // Mail Disabled
      return callback(null, 'Mail Disabled')
    }

    if (!mailSettings.from) return callback('No From Address Set.')

    data.from = mailSettings.from.value

    if (!data.from) return callback('No From Address Set.')

    mailSettings.transporter.sendMail(data, callback)
  })
}

mailer.verify = function (callback) {
  createTransporter(function (err, mailSettings) {
    if (err) return callback(err)

    if (!mailSettings.enabled) return callback({ code: 'Mail Disabled' })

    mailSettings.transporter.verify(function (err) {
      if (err) return callback(err)

      return callback()
    })
  })
}

function createTransporter (callback) {
  settings.getSettings(function (err, s) {
    if (err) return callback(err)

    const mailSettings = {}
    mailSettings.enabled = _.find(s, function (x) {
      return x.name === 'mailer:enable'
    })
    mailSettings.host = _.find(s, function (x) {
      return x.name === 'mailer:host'
    })
    mailSettings.ssl = _.find(s, function (x) {
      return x.name === 'mailer:ssl'
    })
    mailSettings.port = _.find(s, function (x) {
      return x.name === 'mailer:port'
    })
    mailSettings.username = _.find(s, function (x) {
      return x.name === 'mailer:username'
    })
    mailSettings.password = _.find(s, function (x) {
      return x.name === 'mailer:password'
    })
    mailSettings.from = _.find(s, function (x) {
      return x.name === 'mailer:from'
    })

    mailSettings.enabled = mailSettings.enabled && mailSettings.enabled.value ? mailSettings.enabled.value : false

    const transport = {
      host: mailSettings.host && mailSettings.host.value ? mailSettings.host.value : '127.0.0.1',
      port: mailSettings.port && mailSettings.port.value ? mailSettings.port.value : 25,
      secure: mailSettings.ssl && mailSettings.ssl.value ? mailSettings.ssl.value : false,
      tls: {
        rejectUnauthorized: false
      }
    }
    if (mailSettings.username && mailSettings.username.value) {
      transport.auth = {
        user: mailSettings.username.value,
        pass: mailSettings.password && mailSettings.password.value ? mailSettings.password.value : ''
      }
    }

    
    mailSettings.transporter = nodeMailer.createTransport(transport)
    mailer.transporter = mailSettings.transporter

    return callback(null, mailSettings)
  })
}

module.exports = mailer
