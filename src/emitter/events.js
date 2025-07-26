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
const path = require('path')
const async = require('async')
const logger = require('../logger')
const emitter = require('../emitter')
const NotificationSchema = require('../models/notification')
const settingsSchema = require('../models/setting')
const Email = require('email-templates')
const templateDir = path.resolve(__dirname, '..', 'mailer', 'templates')
const socketEvents = require('../socketio/socketEventConsts')
const notifications = require('../notifications') // Load Push Events

const eventTicketCreated = require('./events/event_ticket_created')

;(function () {
  notifications.init(emitter)

  emitter.on('ticket:created', async function (data) {
    await eventTicketCreated(data)
  })

  function sendPushNotification (tpsObj, data) {
    const tpsEnabled = tpsObj.tpsEnabled
    const tpsUsername = tpsObj.tpsUsername
    const tpsApiKey = tpsObj.tpsApiKey
    const hostname = tpsObj.hostname
    let ticket = data.ticket
    const message = data.message

    if (!tpsEnabled || !tpsUsername || !tpsApiKey) {
      logger.debug('Warn: TPS - Push Service Not Enabled')
      return
    }

    if (!hostname) {
      logger.debug('Could not get hostname for push: ' + data.type)
      return
    }

    // Data
    // 1 - Ticket Created
    // 2 - Ticket Comment Added
    // 3 - Ticket Note Added
    // 4 - Ticket Assignee Set
    //  - Message
    let title
    let users = []
    let content, comment, assigneeId, ticketUid
    switch (data.type) {
      case 1:
        title = 'Ticket #' + ticket.uid + ' Created'
        content = ticket.owner.fullname + ' submitted a ticket'
        users = _.map(ticket.group.sendMailTo, function (o) {
          return o._id
        })
        break
      case 2:
        title = 'Ticket #' + ticket.uid + ' Updated'
        content = _.last(ticket.history).description
        comment = _.last(ticket.comments)
        users = _.compact(
          _.map(ticket.subscribers, function (o) {
            if (comment.owner._id.toString() !== o._id.toString()) {
              return o._id
            }
          })
        )
        break
      case 3:
        title = message.owner.fullname + ' sent you a message'
        break
      case 4:
        assigneeId = data.assigneeId
        ticketUid = data.ticketUid
        ticket = {}
        ticket._id = data.ticketId
        ticket.uid = data.ticketUid
        title = 'Assigned to Ticket #' + ticketUid
        content = 'You were assigned to Ticket #' + ticketUid
        users = [assigneeId]
        break
      default:
        title = ''
    }

    if (_.size(users) < 1) {
      logger.debug('No users to push too | UserSize: ' + _.size(users))
      return
    }

    const n = {
      title: title,
      data: {
        ticketId: ticket._id,
        ticketUid: ticket.uid,
        users: users,
        hostname: hostname
      }
    }

    if (content) {
      n.content = content
    }

    notifications.pushNotification(tpsUsername, tpsApiKey, n)
  }

  emitter.on('ticket:updated', function (ticket) {
    io.sockets.emit('$trevyro:client:ticket:updated', { ticket: ticket })
  })

  emitter.on('ticket:deleted', function (oId) {
    io.sockets.emit('ticket:delete', oId)
    io.sockets.emit('$trevyro:client:ticket:deleted', oId)
  })

  emitter.on('ticket:subscriber:update', function (data) {
    io.sockets.emit('ticket:subscriber:update', data)
  })

  emitter.on('ticket:comment:added', function (ticket, comment, hostname) {
    // Goes to client
    io.sockets.emit(socketEvents.TICKETS_UPDATE, ticket)

    settingsSchema.getSettingsByName(['tps:enable', 'tps:username', 'tps:apikey', 'mailer:enable'], function (
      err,
      tpsSettings
    ) {
      if (err) return false

      let tpsEnabled = _.head(_.filter(tpsSettings, ['name', 'tps:enable']))
      let tpsUsername = _.head(_.filter(tpsSettings, ['name', 'tps:username']))
      let tpsApiKey = _.head(_.filter(tpsSettings), ['name', 'tps:apikey'])
      let mailerEnabled = _.head(_.filter(tpsSettings), ['name', 'mailer:enable'])
      mailerEnabled = !mailerEnabled ? false : mailerEnabled.value

      if (!tpsEnabled || !tpsUsername || !tpsApiKey) {
        tpsEnabled = false
      } else {
        tpsEnabled = tpsEnabled.value
        tpsUsername = tpsUsername.value
        tpsApiKey = tpsApiKey.value
      }

      async.parallel(
        [
          function (cb) {
            if (ticket.owner._id.toString() === comment.owner.toString()) return cb
            if (!_.isUndefined(ticket.assignee) && ticket.assignee._id.toString() === comment.owner.toString())
              return cb

            const notification = new NotificationSchema({
              owner: ticket.owner,
              title: 'Comment Added to Ticket#' + ticket.uid,
              message: ticket.subject,
              type: 1,
              data: { ticket: ticket },
              unread: true
            })

            notification.save(function (err) {
              return cb(err)
            })
          },
          function (cb) {
            if (_.isUndefined(ticket.assignee)) return cb()
            if (ticket.assignee._id.toString() === comment.owner.toString()) return cb
            if (ticket.owner._id.toString() === ticket.assignee._id.toString()) return cb()

            const notification = new NotificationSchema({
              owner: ticket.assignee,
              title: 'Comment Added to Ticket#' + ticket.uid,
              message: ticket.subject,
              type: 2,
              data: { ticket: ticket },
              unread: true
            })

            notification.save(function (err) {
              return cb(err)
            })
          },
          function (cb) {
            sendPushNotification(
              {
                tpsEnabled: tpsEnabled,
                tpsUsername: tpsUsername,
                tpsApiKey: tpsApiKey,
                hostname: hostname
              },
              { type: 2, ticket: ticket }
            )
            return cb()
          },
          // Send email to subscribed users
          function (c) {
            if (!mailerEnabled) return c()

            const mailer = require('../mailer')
            let emails = []
            async.each(
              ticket.subscribers,
              function (member, cb) {
                if (_.isUndefined(member) || _.isUndefined(member.email)) return cb()
                if (member._id.toString() === comment.owner.toString()) return cb()
                if (member.deleted) return cb()

                emails.push(member.email)

                cb()
              },
              function (err) {
                if (err) return c(err)

                emails = _.uniq(emails)

                if (_.size(emails) < 1) {
                  return c()
                }

                const email = new Email({
                  views: {
                    root: templateDir,
                    options: {
                      extension: 'handlebars'
                    }
                  }
                })

                ticket.populate('comments.owner', function (err, ticket) {
                  if (err) logger.warn(err)
                  if (err) return c()

                  ticket = ticket.toJSON()

                  email
                    .render('ticket-comment-added', {
                      ticket: ticket,
                      comment: comment
                    })
                    .then(function (html) {
                      const mailOptions = {
                        to: emails.join(),
                        subject: 'Updated: Ticket #' + ticket.uid + '-' + ticket.subject,
                        html: html,
                        generateTextFromHTML: true
                      }

                      mailer.sendMail(mailOptions, function (err) {
                        if (err) logger.warn('[trevyro:events:sendSubscriberEmail] - ' + err)

                        logger.debug('Sent [' + emails.length + '] emails.')
                      })

                      return c()
                    })
                    .catch(function (err) {
                      logger.warn('[trevyro:events:sendSubscriberEmail] - ' + err)
                      return c(err)
                    })
                })
              }
            )
          }
        ],
        function () {
          // Blank
        }
      )
    })
  })

  emitter.on('ticket:note:added', function (ticket) {
    // Goes to client
    io.sockets.emit('updateNotes', ticket)
  })

  emitter.on('trevyro:profileImageUpdate', function (data) {
    io.sockets.emit('trevyro:profileImageUpdate', data)
  })

  emitter.on(socketEvents.ROLES_FLUSH, function () {
    require('../permissions').register(function () {
      io.sockets.emit(socketEvents.ROLES_FLUSH)
    })
  })
})()
