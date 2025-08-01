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
const async = require('async')
const logger = require('../logger')
const conversationSchema = require('../models/chat/conversation')
const messageSchema = require('../models/chat/message')
const messagesController = {}

messagesController.content = {}

messagesController.view = (req, res) => {
  const content = {}
  content.title = 'Messages'
  content.nav = 'messages'
  content.data = {}
  content.data.common = req.viewdata
  if (req.params.convoid) content.data.conversationId = req.params.convoid

  return res.render('messages', content)
}

messagesController.get = function (req, res) {
  const content = {}
  content.title = 'Messages'
  content.nav = 'messages'
  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata
  content.data.conversations = []
  content.data.showNewConvo = req.showNewConvo

  conversationSchema.getConversationsWithLimit(req.user._id, undefined, function (err, convos) {
    if (err) {
      logger.debug(err)
      return handleError(res, err)
    }

    async.eachSeries(
      convos,
      function (convo, done) {
        const c = convo.toObject()

        const userMeta =
          convo.userMeta[
            _.findIndex(convo.userMeta, function (item) {
              return item.userId.toString() === req.user._id.toString()
            })
          ]
        if (!_.isUndefined(userMeta) && !_.isUndefined(userMeta.deletedAt) && userMeta.deletedAt > convo.updatedAt) {
          return done()
        }

        messageSchema.getMostRecentMessage(c._id, function (err, rm) {
          if (err) return done(err)

          _.each(c.participants, function (p) {
            if (p._id.toString() !== req.user._id.toString()) {
              c.partner = p
            }
          })

          rm = _.first(rm)

          if (!_.isUndefined(rm)) {
            if (String(c.partner._id) === String(rm.owner._id)) {
              c.recentMessage = c.partner.fullname + ': ' + rm.body
            } else {
              c.recentMessage = 'You: ' + rm.body
            }
          } else {
            c.recentMessage = 'New Conversation'
          }

          content.data.conversations.push(c)

          return done()
        })
      },
      function (err) {
        if (err) {
          logger.debug(err)
          return handleError(res, err)
        }

        return res.render('messages', content)
      }
    )
  })
}

messagesController.getConversation = async (req, res) => {
  const cid = req.params.convoid
  if (_.isUndefined(cid)) return handleError(res, 'Invalid Conversation ID!')

  const content = {}
  content.title = 'Messages'
  content.nav = 'messages'
  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata
  content.data.conversations = []

  async.parallel(
    [
      function (next) {
        conversationSchema.getConversationsWithLimit(req.user._id, undefined, function (err, convos) {
          if (err) return next(err)

          async.eachSeries(
            convos,
            function (convo, done) {
              const userMeta =
                convo.userMeta[
                  _.findIndex(convo.userMeta, function (item) {
                    return item.userId.toString() === req.user._id.toString()
                  })
                ]
              if (
                !_.isUndefined(userMeta) &&
                !_.isUndefined(userMeta.deletedAt) &&
                userMeta.deletedAt > convo.updatedAt &&
                req.params.convoid.toString() !== convo._id.toString()
              ) {
                return done()
              }

              const c = convo.toObject()
              messageSchema.getMostRecentMessage(c._id, function (err, rm) {
                if (err) return done(err)

                _.each(c.participants, function (p) {
                  if (p._id.toString() !== req.user._id.toString()) {
                    c.partner = p
                  }
                })

                rm = _.first(rm)

                if (!_.isUndefined(rm)) {
                  if (String(c.partner._id) === String(rm.owner._id)) {
                    c.recentMessage = c.partner.fullname + ': ' + rm.body
                  } else {
                    c.recentMessage = 'You: ' + rm.body
                  }
                } else {
                  c.recentMessage = 'New Conversation'
                }

                if (
                  !_.isUndefined(userMeta) &&
                  !_.isUndefined(userMeta.deletedAt) &&
                  !_.isUndefined(rm) &&
                  rm.createdAt < userMeta.deletedAt
                ) {
                  c.recentMessage = 'New Conversation'
                }

                content.data.conversations.push(c)

                return done()
              })
            },
            function (err) {
              if (err) return next(err)

              return next()
            }
          )
        })
      },
      function (next) {
        content.data.page = 2

        conversationSchema.getConversation(cid, function (err, convo) {
          if (err) return next(err)

          if (convo === null || convo === undefined) {
            return res.redirect('/messages')
          }

          const c = convo.toObject()

          let isPart = false
          _.each(c.participants, function (p) {
            if (p._id.toString() === req.user._id.toString()) isPart = true
          })

          if (!isPart) {
            return res.redirect('/messages')
          }

          messageSchema.getConversationWithObject(
            { cid: c._id, userMeta: convo.userMeta, requestingUser: req.user },
            function (err, messages) {
              if (err) return next(err)

              _.each(c.participants, function (p) {
                if (p._id.toString() !== req.user._id.toString()) {
                  c.partner = p
                }
              })

              c.requestingUserMeta =
                convo.userMeta[
                  _.findIndex(convo.userMeta, function (item) {
                    return item.userId.toString() === req.user._id.toString()
                  })
                ]

              content.data.conversation = c
              content.data.conversation.messages = messages.reverse()

              return next()
            }
          )
        })
      }
    ],
    function (err) {
      if (err) return handleError(res, err)
      return res.render('messages', content)
    }
  )
}

function handleError (res, err) {
  if (err) {
    logger.warn(err)
    if (!err.status) res.status = 500
    else res.status = err.status
    return res.render('error', {
      layout: false,
      error: err,
      message: err.message
    })
  }
}

module.exports = messagesController
