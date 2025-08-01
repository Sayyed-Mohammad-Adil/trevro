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

const async = require('async')
const _ = require('lodash')
const logger = require('../../../logger')
const ConversationSchema = require('../../../models/chat/conversation')
const MessageSchema = require('../../../models/chat/message')
const UserSchema = require('../../../models/user')

const apiMessages = {}

/**
 * @api {get} /api/v1/messages Get Messages
 * @apiName getMessages
 * @apiDescription Gets messages for the current logged in user
 * @apiVersion 0.1.8
 * @apiGroup Messages
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/messages
 *
 * @apiSuccess {boolean}    success             Successful?
 * @apiSuccess {array}      messages
 * @apiSuccess {object}     messages._id        The MongoDB ID
 * @apiSuccess {object}     messages.owner      Message Owner
 * @apiSuccess {object}     messages.from       Message From
 * @apiSuccess {string}     messages.subject    Message Subject
 * @apiSuccess {string}     messages.message    Message Text
 * @apiSuccess {date}       messages.date       Message Date
 * @apiSuccess {boolean}    messages.unread     Unread?
 * @apiSuccess {number}     messages.folder     Message Folder
 *
 */

apiMessages.getConversations = function (req, res) {
  ConversationSchema.getConversations(req.user._id, function (err, conversations) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, conversations })
  })
}

apiMessages.getRecentConversations = function (req, res) {
  ConversationSchema.getConversations(req.user._id, function (err, conversations) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    const result = []
    async.eachSeries(
      conversations,
      function (item, done) {
        const idx = _.findIndex(item.userMeta, function (mItem) {
          return mItem.userId.toString() === req.user._id.toString()
        })
        if (idx === -1) {
          return res.status(400).json({ success: false, error: 'Unable to attach to userMeta' })
        }

        MessageSchema.getMostRecentMessage(item._id, function (err, m) {
          if (err) return done(err)
          const r = item.toObject()

          if (_.first(m) === undefined) {
            return done()
          }

          if (item.userMeta[idx].deletedAt && item.userMeta[idx].deletedAt > _.first(m).createdAt) {
            return done()
          }

          r.recentMessage = _.first(m)
          if (!_.isUndefined(r.recentMessage)) {
            r.recentMessage.__v = undefined
            result.push(r)
          }

          return done()
        })
      },
      function (err) {
        if (err) return res.status(400).json({ success: false, error: err })
        return res.json({ success: true, conversations: result })
      }
    )
  })
}

apiMessages.get = function (req, res) {
  ConversationSchema.getConversations(req.user._id, function (err, conversations) {
    if (err) return res.status(400).json({ success: false, error: err })
    const fullConversations = []

    async.forEach(
      conversations,
      function (item, done) {
        MessageSchema.getFullConversation(item._id, function (err, messages) {
          if (err) return done(err)
          fullConversations.push({
            cId: item._id,
            p: item.participants,
            messages
          })

          return done()
        })
      },
      function (err) {
        if (err) return res.status(400).json({ success: false, error: err })
        return res.json({ success: true, conversations: fullConversations })
      }
    )
  })
}

apiMessages.startConversation = function (req, res) {
  const payload = req.body
  const requester = payload.owner
  const participants = payload.participants

  // Check if Conversation with these participants exist
  ConversationSchema.getConversations(participants, function (err, convo) {
    if (err) {
      return res.status(400).json({ success: false, error: err.message })
    }

    if (convo.length > 0) {
      const conversation = _.first(convo)
      const userMeta =
        conversation.userMeta[_.findIndex(conversation.userMeta, i => i.userId.toString() === requester.toString())]
      if (userMeta) {
        userMeta.updatedAt = Date.now()
        conversation.save((err, updatedConvo) => {
          if (err) logger.debug(err)
          return res.json({ success: true, conversation: updatedConvo })
        })
      } else return res.json({ success: true, conversation })
    }

    if (convo.length < 1) {
      const userMeta = []
      _.each(participants, function (item) {
        const meta = {
          userId: item,
          joinedAt: new Date()
        }

        if (requester === item) {
          meta.lastRead = new Date()
        }

        userMeta.push(meta)
      })

      const Conversation = new ConversationSchema({
        participants,
        userMeta,
        updatedAt: new Date()
      })

      Conversation.save(function (err, cSave) {
        if (err) {
          logger.debug(err)
          return res.status(400).json({ success: false, error: err.message })
        }

        return res.json({ success: true, conversation: cSave })
      })
    }
  })
}

apiMessages.send = function (req, res) {
  const payload = req.body
  const cId = payload.cId
  const owner = payload.owner
  let message = payload.body
  const matches = message.match(/^[Tt]#[0-9]*$/g)

  if (!_.isNull(matches) && matches.length > 0) {
    _.each(matches, function (m) {
      message = message.replace(
        m,
        '<a href="/tickets/' +
          m.replace('T#', '').replace('t#', '') +
          '">T#' +
          m.replace('T#', '').replace('t#', '') +
          '</a>'
      )
    })
  }

  async.waterfall(
    [
      function (done) {
        ConversationSchema.findOne({ _id: cId }, function (err, convo) {
          if (err || !convo) return done('Invalid Conversation')

          return done(null, convo)
        })
      },
      function (convo, done) {
        // Updated conversation to save UpdatedAt field.
        convo.updatedAt = new Date()
        convo.save(function (err, savedConvo) {
          if (err) return done(err)

          return done(null, savedConvo)
        })
      },
      function (convo, done) {
        UserSchema.findOne({ _id: owner }, function (err, user) {
          if (err || !user) return done('Invalid Conversation')

          return done(null, user, convo)
        })
      },
      function (user, convo, done) {
        const Message = new MessageSchema({
          conversation: convo._id,
          owner: user,
          body: message
        })

        Message.save(function (err, mSave) {
          if (err) {
            return done(err)
          }

          // Update conversation Meta!!
          return done(null, mSave)
        })
      }
    ],
    function (err, mSave) {
      if (err) {
        logger.debug(err)
        return res.status(400).json({ success: false, error: err.message })
      }
      return res.json({ success: true, message: mSave })
    }
  )
}

apiMessages.getMessagesForConversation = function (req, res) {
  const conversation = req.params.id
  const page = req.query.page === undefined ? 0 : req.query.page
  const limit = req.query.limit === undefined ? 10 : req.query.limit
  if (_.isUndefined(conversation) || _.isNull(conversation)) {
    return res.status(400).json({ success: false, error: 'Invalid Conversation' })
  }

  const response = {}
  async.series(
    [
      function (done) {
        ConversationSchema.getConversation(conversation, function (err, convo) {
          if (err) return done(err)
          if (!convo) return done({ message: 'Invalid Conversation' })

          response.conversation = convo

          return done()
        })
      },
      function (done) {
        MessageSchema.getConversationWithObject(
          {
            cid: conversation,
            page,
            limit,
            userMeta: response.conversation.userMeta,
            requestingUser: req.user
          },
          function (err, messages) {
            if (err) return done(err)

            response.messages = messages

            done()
          }
        )
      }
    ],
    function (err) {
      if (err) {
        logger.debug(err)
        return res.status(400).json({ success: false, error: err.message })
      }

      return res.json({
        success: true,
        conversation: response.conversation,
        messages: response.messages
      })
    }
  )
}

apiMessages.deleteConversation = function (req, res) {
  const conversation = req.params.id

  if (_.isUndefined(conversation) || _.isNull(conversation)) {
    return res.status(400).json({ success: false, error: 'Invalid Conversation' })
  }

  ConversationSchema.getConversation(conversation, function (err, convo) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    const user = req.user
    const idx = _.findIndex(convo.userMeta, function (item) {
      return item.userId.toString() === user._id.toString()
    })
    if (idx === -1) {
      return res.status(400).json({ success: false, error: 'Unable to attach to userMeta' })
    }

    convo.userMeta[idx].deletedAt = new Date()

    convo.save(function (err, sConvo) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      const cleanConvo = sConvo.toObject()
      cleanConvo.participants.forEach(function (p) {
        delete p._id
        delete p.id
        delete p.role
      })

      cleanConvo.userMeta.forEach(function (meta) {
        delete meta.userId
      })

      return res.json({ success: true, conversation: cleanConvo })
    })
  })
}

module.exports = apiMessages
