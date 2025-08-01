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
const permissions = require('../../../permissions')
const emitter = require('../../../emitter')
const UserSchema = require('../../../models/user')
const groupSchema = require('../../../models/group')
const notificationSchema = require('../../../models/notification')
const SettingUtil = require('../../../settings/settingsUtil')
const Chance = require('chance')

const apiUsers = {}

/**
 * @api {get} /api/v1/users Gets users with query string
 * @apiName getUsers
 * @apiDescription Gets users with query string
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 *
 * @apiSuccess {boolean} success If the Request was a success
 * @apiSuccess {object} error Error, if occurred
 * @apiSuccess {number} count Count of users in array
 * @apiSuccess {array} users Users returned (populated)
 *
 * @apiError InvalidPostData The data was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Post Data"
 }
 */
apiUsers.getWithLimit = function (req, res) {
  let limit = 10
  if (!_.isUndefined(req.query.limit)) {
    limit = parseInt(req.query.limit)
  }
  const page = parseInt(req.query.page)
  const search = req.query.search

  const obj = {
    limit: limit,
    page: page,
    search: search
  }

  async.waterfall(
    [
      function (callback) {
        UserSchema.getUserWithObject(obj, function (err, results) {
          callback(err, results)
        })
      },
      function (users, callback) {
        const result = []

        async.waterfall(
          [
            function (cc) {
              groupSchema.getAllGroups(function (err, grps) {
                if (err) return cc(err)
                return cc(null, grps)
              })
            },
            function (grps, cc) {
              async.eachSeries(
                users,
                function (u, c) {
                  const user = u.toObject()

                  const groups = _.filter(grps, function (g) {
                    return _.some(g.members, function (m) {
                      return m._id.toString() === user._id.toString()
                    })
                  })

                  user.groups = _.map(groups, function (group) {
                    return { name: group.name, _id: group._id }
                  })

                  result.push(stripUserFields(user))
                  return c()
                },
                function (err) {
                  if (err) return callback(err)
                  return cc(null, result)
                }
              )
            }
          ],
          function (err, results) {
            if (err) return callback(err)
            return callback(null, results)
          }
        )
      }
    ],
    function (err, rr) {
      if (err) return res.status(400).json({ error: 'Error: ' + err.message })

      return res.json({ success: true, count: _.size(rr), users: rr })
    }
  )
}

/**
 * @api {post} /api/v1/users/create Create Account
 * @apiName createAccount
 * @apiDescription Creates an account with the given post data.
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 *
 * @apiParamExample {json} Request-Example:
 * {
 *      "aUsername":    "user.name",
 *      "aPass":        "password",
 *      "aPassConfirm": "password",
 *      "aFullname":    "fullname",
 *      "aEmail":       "email@email.com",
 *      "aRole":        {RoleId},
 *      "aTitle":       "User Title",
 *      "aGrps":        [{GroupId}]
 * }
 *
 * @apiSuccess {boolean} success If the Request was a success
 * @apiSuccess {object} error Error, if occurred
 * @apiSuccess {object} account Saved Account Object
 *
 * @apiError InvalidPostData The data was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Post Data"
 }
 */
apiUsers.create = async function (req, res) {
  const response = {}
  response.success = true

  const postData = req.body

  if (_.isUndefined(postData) || !_.isObject(postData)) {
    return res.status(400).json({ success: false, error: 'Invalid Post Data' })
  }

  const propCheck = ['aUsername', 'aPass', 'aPassConfirm', 'aFullname', 'aEmail', 'aRole']

  if (
    !_.every(propCheck, function (x) {
      return x in postData
    })
  ) {
    return res.status(400).json({ success: false, error: 'Invalid Post Data' })
  }

  if (_.isUndefined(postData.aGrps) || _.isNull(postData.aGrps) || !_.isArray(postData.aGrps)) {
    return res.status(400).json({ success: false, error: 'Invalid Group Array' })
  }

  if (postData.aPass !== postData.aPassConfirm)
    return res.status(400).json({ success: false, error: 'Invalid Password Match' })

  async.series(
    [
      function (next) {
        SettingUtil.getSettings(function (err, content) {
          if (err) return next(err)
          const settings = content.data.settings
          if (settings.accountsPasswordComplexity.value) {
            const passwordComplexity = require('../../../settings/passwordComplexity')
            if (!passwordComplexity.validate(postData.aPass))
              return next({ message: 'Password does not meet minimum requirements.' })

            return next()
          }

          return next()
        })
      },
      function (next) {
        const chance = new Chance()

        const account = new UserSchema({
          username: postData.aUsername,
          password: postData.aPass,
          fullname: postData.aFullname,
          email: postData.aEmail,
          accessToken: chance.hash(),
          role: postData.aRole
        })

        if (postData.aTitle) {
          account.title = postData.aTitle
        }

        account.save(function (err, a) {
          if (err) return next(err)

          a.populate('role', function (err, populatedAccount) {
            if (err) return next(err)

            response.account = populatedAccount.toObject()
            delete response.account.password

            const groups = []

            async.each(
              postData.aGrps,
              function (id, done) {
                if (_.isUndefined(id)) return done()
                groupSchema.getGroupById(id, function (err, grp) {
                  if (err) return done(err)
                  if (!grp) return done({ message: `Invalid Group (${id}) - Group not found. Check Group ID.` })

                  grp.addMember(a._id, function (err, success) {
                    if (err) return done(err)

                    grp.save(function (err) {
                      if (err) return done(err)
                      groups.push(grp)
                      done(null, success)
                    })
                  })
                })
              },
              function (e) {
                if (e) return next(e)
                response.account.groups = groups

                return next()
              }
            )
          })
        })
      }
    ],
    function (e) {
      if (e) {
        response.success = false
        response.error = e
        logger.debug(response)
        return res.status(400).json(response)
      }

      return res.json(response)
    }
  )
}

/**
 * @api {post} /api/v1/public/account/create Create Public Account
 * @apiName createPublicAccount
 * @apiDescription Creates an account with the given post data.
 * @apiVersion 0.1.8
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 *
 * @apiParamExample {json} Request-Example:
 * {
 *      "aFullname":    "user name",
 *      "aEmail":       "email@email.com""
 *      "aPassword":    "password",
 * }
 *
 * @apiSuccess {boolean} success If the Request was a success
 * @apiSuccess {object} error Error, if occurred
 * @apiSuccess {object} account Saved Account Object
 *
 * @apiError InvalidPostData The data was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Post Data"
 }
 */
apiUsers.createPublicAccount = function (req, res) {
  const SettingSchema = require('../../../models/setting')

  const response = {}
  response.success = true
  const postData = req.body
  if (!_.isObject(postData)) return res.status(400).json({ success: false, error: 'Invalid Post Data' })

  let user, group

  async.waterfall(
    [
      function (next) {
        SettingSchema.getSetting('allowUserRegistration:enable', function (err, allowUserRegistration) {
          if (err) return next(err)
          if (!allowUserRegistration) {
            logger.warn('Public account creation was attempted while disabled!')
            return next({ message: 'Public account creation is disabled.' })
          }

          return next()
        })
      },
      function (next) {
        SettingSchema.getSetting('role:user:default', function (err, roleDefault) {
          if (err) return next(err)
          if (!roleDefault) {
            logger.error('No Default User Role Set. (Settings > Permissions > Default User Role)')
            return next({ message: 'No Default Role Set. Please contact administrator.' })
          }

          return next(null, roleDefault)
        })
      },
      function (roleDefault, next) {
        SettingSchema.getSetting('accountsPasswordComplexity:enable', function (err, passwordComplexitySetting) {
          if (err) return next(err)
          if (!passwordComplexitySetting || passwordComplexitySetting.value === true) {
            const passwordComplexity = require('../../../settings/passwordComplexity')
            if (!passwordComplexity.validate(postData.user.password))
              return next({ message: 'Password does not minimum requirements.' })

            return next(null, roleDefault)
          }

          return next(null, roleDefault)
        })
      },
      function (roleDefault, next) {
        const UserSchema = require('../../../models/user')
        user = new UserSchema({
          username: postData.user.email,
          password: postData.user.password,
          fullname: postData.user.fullname,
          email: postData.user.email,
          role: roleDefault.value
        })

        user.save(function (err, savedUser) {
          if (err) return next(err)

          return next(null, savedUser)
        })
      },
      function (savedUser, next) {
        const GroupSchema = require('../../../models/group')
        group = new GroupSchema({
          name: savedUser.email,
          members: [savedUser._id],
          sendMailTo: [savedUser._id],
          public: true
        })

        group.save(function (err, savedGroup) {
          if (err) return next(err)

          return next(null, { user: savedUser, group: savedGroup })
        })
      }
    ],
    function (err, result) {
      if (err) logger.debug(err)
      if (err) return res.status(400).json({ success: false, error: err.message })

      delete result.user.password
      result.user.password = undefined

      return res.json({
        success: true,
        userData: { user: result.user, group: result.group }
      })
    }
  )
}

apiUsers.profileUpdate = function (req, res) {
  if (!req.user) return res.status(400).json({ success: false, error: 'Invalid Post Data' })
  const username = req.user.username
  if (_.isNull(username) || _.isUndefined(username))
    return res.status(400).json({ success: false, error: 'Invalid Post Data' })

  const data = req.body
  let passwordUpdated = false

  const obj = {
    fullname: data.aFullname,
    title: data.aTitle,
    password: data.aPassword,
    passconfirm: data.aPassConfirm,
    email: data.aEmail
  }

  let passwordComplexityEnabled = true

  async.series(
    {
      settings: function (done) {
        const SettingUtil = require('../../../settings/settingsUtil')
        SettingUtil.getSettings(function (err, content) {
          if (err) return done(err)

          const settings = content.data.settings
          passwordComplexityEnabled = settings.accountsPasswordComplexity.value

          return done()
        })
      },
      user: function (done) {
        UserSchema.getUserByUsername(username, function (err, user) {
          if (err) return done(err)
          if (!user) return done('Invalid User Object')

          obj._id = user._id

          if (
            !_.isUndefined(obj.password) &&
            !_.isEmpty(obj.password) &&
            !_.isUndefined(obj.passconfirm) &&
            !_.isEmpty(obj.passconfirm)
          ) {
            if (obj.password === obj.passconfirm) {
              if (passwordComplexityEnabled) {
                // check Password Complexity
                const passwordComplexity = require('../../../settings/passwordComplexity')
                if (!passwordComplexity.validate(obj.password)) return done('Password does not meet requirements')
              }

              user.password = obj.password
              passwordUpdated = true
            }
          }

          if (!_.isUndefined(obj.fullname) && obj.fullname.length > 0) user.fullname = obj.fullname
          if (!_.isUndefined(obj.email) && obj.email.length > 0) user.email = obj.email
          if (!_.isUndefined(obj.title) && obj.title.length > 0) user.title = obj.title

          user.save(function (err, nUser) {
            if (err) return done(err)

            nUser.populate('role', function (err, populatedUser) {
              if (err) return done(err)
              const resUser = stripUserFields(populatedUser)

              return done(null, resUser)
            })
          })
        })
      },
      groups: function (done) {
        groupSchema.getAllGroupsOfUser(obj._id, done)
      }
    },
    async function (err, results) {
      if (err) {
        logger.debug(err)
        return res.status(400).json({ success: false, error: err })
      }

      const user = results.user.toJSON()
      user.groups = results.groups.map(function (g) {
        return { _id: g._id, name: g.name }
      })

      if (passwordUpdated) {
        const Session = require('../../../models/session')
        await Session.destroy(user._id)
      }

      return res.json({ success: true, user: user })
    }
  )
}

/**
 * @api {put} /api/v1/users/:username Update User
 * @apiName updateUser
 * @apiDescription Updates a single user.
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiParamExample {json} Request:
 * {
        aId:            {{_id}},
        aUsername:      {{username}},
        aFullname:      {{fullname}},
        aTitle:         {{title}},
        aPass:          {{password}},
        aPassconfirm:   {{password_confirm}},
        aEmail:         {{email}},
        aRole:          {{role.id}},
        aGrps:          [{{group._id}}]
 * }
 *
 * @apiSuccess {object} user Saved User Object [Stripped]
 *
 * @apiError InvalidPostData The data was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Post Data"
 }
 */
apiUsers.update = function (req, res) {
  const username = req.params.username
  if (_.isNull(username) || _.isUndefined(username))
    return res.status(400).json({ success: false, error: 'Invalid Post Data' })

  const data = req.body
  // saveGroups - Profile saving where groups are not sent
  const saveGroups = !_.isUndefined(data.saveGroups) ? data.saveGroups : true
  let passwordUpdated = false

  const obj = {
    fullname: data.aFullname,
    title: data.aTitle,
    password: data.aPass,
    passconfirm: data.aPassConfirm,
    email: data.aEmail,
    role: data.aRole,
    groups: data.aGrps
  }

  if (_.isNull(obj.groups) || _.isUndefined(obj.groups)) {
    obj.groups = []
  } else if (!_.isArray(obj.groups)) {
    obj.groups = [obj.groups]
  }

  let passwordComplexityEnabled = true

  async.series(
    {
      settings: function (done) {
        var SettingUtil = require('../../../settings/settingsUtil')
        SettingUtil.getSettings(function (err, content) {
          if (err) return done(err)
          var settings = content.data.settings
          passwordComplexityEnabled = settings.accountsPasswordComplexity.value

          return done()
        })
      },
      user: function (done) {
        UserSchema.getUserByUsername(username, function (err, user) {
          if (err) return done(err)
          if (!user) return done('Invalid User Object')

          obj._id = user._id

          if (
            !_.isUndefined(obj.password) &&
            !_.isEmpty(obj.password) &&
            !_.isUndefined(obj.passconfirm) &&
            !_.isEmpty(obj.passconfirm)
          ) {
            if (obj.password === obj.passconfirm) {
              if (passwordComplexityEnabled) {
                // check Password Complexity
                const passwordComplexity = require('../../../settings/passwordComplexity')
                if (!passwordComplexity.validate(obj.password)) return done('Password does not meet requirements')
              }

              user.password = obj.password
              passwordUpdated = true
            }
          }

          if (!_.isUndefined(obj.fullname) && obj.fullname.length > 0) user.fullname = obj.fullname
          if (!_.isUndefined(obj.email) && obj.email.length > 0) user.email = obj.email
          if (!_.isUndefined(obj.title) && obj.title.length > 0) user.title = obj.title
          if (!_.isUndefined(obj.role) && obj.role.length > 0) user.role = obj.role

          user.save(function (err, nUser) {
            if (err) return done(err)

            nUser.populate('role', function (err, populatedUser) {
              if (err) return done(err)
              const resUser = stripUserFields(populatedUser)

              return done(null, resUser)
            })
          })
        })
      },
      groups: function (done) {
        if (!saveGroups) {
          groupSchema.getAllGroupsOfUser(obj._id, done)
        } else {
          const userGroups = []
          groupSchema.getAllGroups(function (err, groups) {
            if (err) return done(err)
            async.each(
              groups,
              function (grp, callback) {
                if (_.includes(obj.groups, grp._id.toString())) {
                  if (grp.isMember(obj._id)) {
                    userGroups.push(grp)
                    return callback()
                  }
                  grp.addMember(obj._id, function (err, result) {
                    if (err) return callback(err)

                    if (result) {
                      grp.save(function (err) {
                        if (err) return callback(err)
                        userGroups.push(grp)
                        return callback()
                      })
                    } else {
                      return callback()
                    }
                  })
                } else {
                  // Remove Member from group
                  grp.removeMember(obj._id, function (err, result) {
                    if (err) return callback(err)
                    if (result) {
                      grp.save(function (err) {
                        if (err) return callback(err)

                        return callback()
                      })
                    } else {
                      return callback()
                    }
                  })
                }
              },
              function (err) {
                if (err) return done(err)

                return done(null, userGroups)
              }
            )
          })
        }
      }
    },
    async function (err, results) {
      if (err) {
        logger.debug(err)
        return res.status(400).json({ success: false, error: err })
      }

      const user = results.user.toJSON()
      user.groups = results.groups.map(function (g) {
        return { _id: g._id, name: g.name }
      })

      if (passwordUpdated) {
        const Session = require('../../../models/session')
        await Session.destroy(user._id)
      }

      return res.json({ success: true, user: user })
    }
  )
}

/**
 * @api {put} /api/v1/users/:username/updatepreferences Updates User Preferences
 * @apiName updatePreferences
 * @apiDescription Updates a single user preference.
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "Content-Type: application/json" -H "accesstoken: {accesstoken}" -X PUT -d "{\"preference\":\"{preference_name}\",\"value\":{value}}" -l http://localhost/api/v1/users/{username}/updatepreferences
 *
 * @apiParamExample {json} Request:
 * {
 *      "preference": "preference_name",
 *      "value": "preference_value"
 * }
 *
 * @apiSuccess {object} user Saved User Object [Stripped]
 *
 * @apiError InvalidPostData The data was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Post Data"
 }
 */
apiUsers.updatePreferences = function (req, res) {
  const username = req.params.username
  if (typeof username === 'undefined') {
    return res.status(400).json({ success: false, error: 'Invalid Request' })
  }

  const data = req.body
  const preference = data.preference
  const value = data.value

  UserSchema.getUserByUsername(username, function (err, user) {
    if (err) {
      logger.warn('[API:USERS:UpdatePreferences] Error= ' + err)
      return res.status(400).json({ success: false, error: err })
    }

    if (_.isNull(user.preferences)) {
      user.preferences = {}
    }

    user.preferences[preference] = value

    user.save(function (err, u) {
      if (err) {
        logger.warn('[API:USERS:UpdatePreferences] Error= ' + err)
        return res.status(400).json({ success: false, error: err })
      }

      const resUser = stripUserFields(u)

      return res.json({ success: true, user: resUser })
    })
  })
}

/**
 * @api {delete} /api/v1/users/:username Delete / Disable User
 * @apiName deleteUser
 * @apiDescription Disables or Deletes the giving user via username
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -X DELETE -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:username
 *
 * @apiSuccess {boolean}     success    Was the user successfully Deleted or disabled.
 *
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.deleteUser = function (req, res) {
  const username = req.params.username

  if (_.isUndefined(username) || _.isNull(username)) return res.status(400).json({ error: 'Invalid Request' })

  async.waterfall(
    [
      function (cb) {
        UserSchema.getUserByUsername(username, function (err, user) {
          if (err) return cb(err)

          if (_.isNull(user)) {
            return cb({ message: 'Invalid User' })
          }

          if (user.username.toLowerCase() === req.user.username) {
            return cb({ message: 'Cannot remove yourself!' })
          }

          if (!permissions.canThis(req.user.role, 'accounts:delete')) return cb({ message: 'Access Denied' })

          // TODO: FIX THIS FOR HIERARCHY!!
          // if (req.user.role.toLowerCase() === 'support' || req.user.role.toLowerCase() === 'user') {
          //     if (user.role.toLowerCase() === 'mod' || user.role.toLowerCase() === 'admin')
          //         return cb({message: 'Insufficient permissions'});
          //
          // }

          return cb(null, user)
        })
      },
      function (user, cb) {
        const ticketSchema = require('../../../models/ticket')
        ticketSchema.find({ owner: user._id }, function (err, tickets) {
          if (err) return cb(err)

          const hasTickets = _.size(tickets) > 0
          return cb(null, hasTickets, user)
        })
      },
      function (hasTickets, user, cb) {
        const conversationSchema = require('../../../models/chat/conversation')
        conversationSchema.getConversationsWithLimit(user._id, 10, function (err, conversations) {
          if (err) return cb(err)

          const hasConversations = _.size(conversations) > 0
          return cb(null, hasTickets, hasConversations, user)
        })
      },
      function (hasTickets, hasConversations, user, cb) {
        const ticketSchema = require('../../../models/ticket')
        ticketSchema.find({ assignee: user._id }, function (err, tickets) {
          if (err) return cb(err)

          const isAssignee = _.size(tickets) > 0
          return cb(null, hasTickets, hasConversations, isAssignee, user)
        })
      },
      function (hasTickets, hasConversations, isAssignee, user, cb) {
        if (hasTickets || hasConversations || isAssignee) {
          // Disable if the user has tickets or conversations
          user.softDelete(function (err) {
            if (err) return cb(err)

            // Force logout if Logged in
            return cb(null, true)
          })
        } else {
          user.remove(function (err) {
            if (err) return cb(err)

            return cb(null, false)
          })
        }
      }
    ],
    function (err, disabled) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      return res.json({ success: true, disabled: disabled })
    }
  )
}

/**
 * @api {get} /api/v1/users/:username/enable Enable User
 * @apiName enableUser
 * @apiDescription Enable the giving user via username
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -X DELETE -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:username/enable
 *
 * @apiSuccess {boolean}     success    Was the user successfully enabled.
 *
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.enableUser = function (req, res) {
  const username = req.params.username
  if (_.isUndefined(username)) return res.status(400).json({ error: 'Invalid Request' })

  UserSchema.getUserByUsername(username, function (err, user) {
    if (err) {
      logger.debug(err)
      return res.status(400).json({ error: err.message })
    }

    if (_.isUndefined(user) || _.isNull(user)) return res.status(400).json({ error: 'Invalid Request' })

    if (!permissions.canThis(req.user.role, 'accounts:delete'))
      return res.status(401).json({ error: 'Invalid Permissions' })

    user.deleted = false

    user.save(function (err) {
      if (err) return res.status(400).json({ error: err.message })

      res.json({ success: true })
    })
  })
}

/**
 * @api {get} /api/v1/users/:username Get User
 * @apiName getUser
 * @apiDescription Gets the user via the given username
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:username
 *
 * @apiSuccess {object}     _id                 The MongoDB ID
 * @apiSuccess {string}     username            Username of the User
 * @apiSuccess {string}     fullname            Fullname of the User
 * @apiSuccess {string}     email               Email Address of the User
 * @apiSuccess {string}     role                Assigned Permission Role of the user
 * @apiSuccess {string}     title               Title of the User
 * @apiSuccess {string}     image               Image filename for the user's profile picture
 * @apiSuccess {array}      iOSDeviceTokens     iOS Device Tokens for push notifications
 *
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.single = function (req, res) {
  const username = req.params.username
  if (_.isUndefined(username)) return res.status(400).json({ error: 'Invalid Request.' })

  const response = {
    success: true,
    groups: []
  }

  async.waterfall(
    [
      function (done) {
        UserSchema.getUserByUsername(username, function (err, user) {
          if (err) return done(err)

          if (_.isUndefined(user) || _.isNull(user)) return done('Invalid Request')

          user = stripUserFields(user)
          response.user = user

          done(null, user)
        })
      },
      function (user, done) {
        groupSchema.getAllGroupsOfUserNoPopulate(user._id, function (err, grps) {
          if (err) return done(err)

          response.groups = _.map(grps, function (o) {
            return o._id
          })

          done(null, response.groups)
        })
      }
    ],
    function (err) {
      if (err) return res.status(400).json({ error: err })

      res.json(response)
    }
  )
}

/**
 * @api {get} /api/v1/users/notificationCount Get Notification Count
 * @apiName getNotificationCount
 * @apiDescription Gets the current notification count for the currently logged in user.
 * @apiVersion 0.1.0
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/notificationCount
 *
 * @apiSuccess {string}     count   The Notification Count
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.notificationCount = function (req, res) {
  notificationSchema.getUnreadCount(req.user._id, function (err, count) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    return res.json({ success: true, count: count.toString() })
  })
}

apiUsers.getNotifications = function (req, res) {
  notificationSchema.findAllForUser(req.user._id, function (err, notifications) {
    if (err) return res.status(500).json({ success: false, error: err.message })

    return res.json({ success: true, notifications: notifications })
  })
}

/**
 * @api {post} /api/v1/users/:id/generateapikey Generate API Key
 * @apiName generateApiKey
 * @apiDescription Generates an API key for the given user id
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:id/generateapikey
 *
 * @apiSuccess {string}     token   Generated API Key
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.generateApiKey = function (req, res) {
  const id = req.params.id
  if (_.isUndefined(id) || _.isNull(id)) return res.status(400).json({ error: 'Invalid Request' })
  if (!req.user.role.isAdmin && req.user._id.toString() !== id)
    return res.status(401).json({ success: false, error: 'Unauthorized' })

  UserSchema.getUser(id, function (err, user) {
    if (err || !user) return res.status(400).json({ success: false, error: 'Invalid Request' })

    // if (user.accessToken) return res.status(400).json({ success: false, error: 'User already has generated token' })

    user.addAccessToken(function (err, token) {
      if (err) return res.status(400).json({ error: 'Invalid Request' })

      res.json({ token: token })
    })
  })
}

/**
 * @api {post} /api/v1/users/:id/removeapikey Removes API Key
 * @apiName removeApiKey
 * @apiDescription Removes API key for the given user id
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:id/removeapikey
 *
 * @apiSuccess {boolean}     success   Successful?
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.removeApiKey = function (req, res) {
  const id = req.params.id
  if (_.isUndefined(id) || _.isNull(id)) return res.status(400).json({ error: 'Invalid Request' })

  if (!req.user.isAdmin && req.user._id.toString() !== id) return res.status(401).json({ success: 'Unauthorized' })

  UserSchema.getUser(id, function (err, user) {
    if (err) return res.status(400).json({ error: 'Invalid Request', fullError: err })

    user.removeAccessToken(function (err) {
      if (err) return res.status(400).json({ error: 'Invalid Request', fullError: err })

      return res.json({ success: true })
    })
  })
}

/**
 * @api {post} /api/v1/users/:id/generatel2auth Generate Layer Two Auth
 * @apiName generateL2Auth
 * @apiDescription Generate a new layer two auth for the given user id
 * @apiVersion 0.1.8
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:id/generatel2auth
 *
 * @apiSuccess {boolean}     success   Successful?
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.generateL2Auth = function (req, res) {
  const id = req.params.id
  if (id.toString() !== req.user._id.toString()) {
    return res.status(400).json({ success: false, error: 'Invalid Account Owner!' })
  }

  UserSchema.getUser(id, function (err, user) {
    if (err) return res.status(400).json({ success: false, error: 'Invalid Request' })

    user.generateL2Auth(function (err, generatedKey) {
      if (err) return res.status(400).json({ success: false, error: 'Invalid Request' })

      req.session.l2auth = 'totp'
      return res.json({ success: true, generatedKey: generatedKey })
    })
  })
}

/**
 * @api {post} /api/v1/users/:id/removel2auth Removes Layer Two Auth
 * @apiName removeL2Auth
 * @apiDescription Removes Layer Two Auth for the given user id
 * @apiVersion 0.1.8
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/:id/removel2auth
 *
 * @apiSuccess {boolean}     success   Successful?
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.removeL2Auth = function (req, res) {
  const id = req.params.id
  if (id.toString() !== req.user._id.toString()) {
    return res.status(400).json({ success: false, error: 'Invalid Account Owner!' })
  }

  UserSchema.getUser(id, function (err, user) {
    if (err) return res.status(400).json({ success: false, error: 'Invalid Request' })

    user.removeL2Auth(function (err) {
      if (err) return res.status(400).json({ success: false, error: 'Invalid Request' })

      req.session.l2auth = null
      return res.json({ success: true })
    })
  })
}

/**
 * @api {post} /api/v1/users/checkemail
 * @apiName checkEmail
 * @apiDescription Returns a true if email exists
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/checkemail
 *
 * @apiSuccess {boolean}     success   Successful?
 * @apiSuccess {boolean}     emailexist Does Email Exist?
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */

apiUsers.checkEmail = function (req, res) {
  const email = req.body.email

  if (_.isUndefined(email) || _.isNull(email)) {
    return res.status(400).json({ success: false, error: 'Invalid Post Data' })
  }

  UserSchema.getUserByEmail(email, function (err, users) {
    if (err) return res.status(400).json({ success: false, error: err.message })

    if (!_.isNull(users)) {
      return res.json({ success: true, exist: true })
    }

    return res.json({ success: true, exist: false })
  })
}

/**
 * @api {get} /api/v1/users/getassignees Get Assignees
 * @apiName getassignees
 * @apiDescription Returns a list of assignable users
 * @apiVersion 0.1.7
 * @apiGroup User
 * @apiHeader {string} accesstoken The access token for the logged in user
 * @apiExample Example usage:
 * curl -H "accesstoken: {accesstoken}" -l http://localhost/api/v1/users/getassignees
 *
 * @apiSuccess {boolean}     success   Successful?
 * @apiSuccess {array}       users     Array of Assignees
 *
 * @apiError InvalidRequest The request was invalid
 * @apiErrorExample
 *      HTTP/1.1 400 Bad Request
 {
     "error": "Invalid Request"
 }
 */
apiUsers.getAssingees = function (req, res) {
  UserSchema.getAssigneeUsers(function (err, users) {
    if (err) return res.status(400).json({ error: 'Invalid Request' })

    const strippedUsers = []

    async.each(
      users,
      function (user, cb) {
        user = stripUserFields(user)
        strippedUsers.push(user)

        cb()
      },
      function () {
        return res.json({ success: true, users: strippedUsers })
      }
    )
  })
}

apiUsers.getGroups = function (req, res) {
  if (req.user.role.isAdmin || req.user.role.isAgent) {
    const departmentSchema = require('../../../models/department')
    departmentSchema.getDepartmentGroupsOfUser(req.user._id, function (err, groups) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      const mappedGroups = groups.map(function (g) {
        return g._id
      })

      return res.json({ success: true, groups: mappedGroups })
    })
  } else {
    if (req.user.username !== req.params.username)
      return res.status(400).json({ success: false, error: 'Invalid API Call' })

    groupSchema.getAllGroupsOfUserNoPopulate(req.user._id, function (err, groups) {
      if (err) return res.status(400).json({ success: false, error: err.message })

      const mappedGroups = groups.map(function (g) {
        return g._id
      })

      return res.json({ success: true, groups: mappedGroups })
    })
  }
}

function stripUserFields (user) {
  user.password = undefined
  user.accessToken = undefined
  user.__v = undefined
  user.tOTPKey = undefined
  user.iOSDeviceTokens = undefined

  return user
}

module.exports = apiUsers
