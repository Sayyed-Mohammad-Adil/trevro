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
const utils = require('../helpers/utils')
const UserSchema = require('../models/user')
const Role = require('../models/role')
const permissions = require('../permissions')

const events = {}

function register (socket) {
  events.onImportCSV(socket)
  events.onImportJSON(socket)
  events.onImportLDAP(socket)
}

function eventLoop () {}

events.onImportCSV = socket => {
  socket.on('$trevyro:accounts:import:csv', async data => {
    const authUser = socket.request.user
    if (!permissions.canThis(authUser.role, 'accounts:import')) {
      // Send Error Socket Emit
      logger.warn('[$trevyro:accounts:import:csv] - Error: Invalid permissions.')
      utils.sendToSelf(socket, '$trevyro:accounts:import:error', {
        error: 'Invalid Permissions. Check Console.'
      })
      return
    }

    const addedUsers = data.addedUsers
    const updatedUsers = data.updatedUsers

    let completedCount = 0

    for (const addedUser of addedUsers) {
      const data = {
        type: 'csv',
        totalCount: addedUsers.length + updatedUsers.length,
        completedCount,
        item: { username: addedUser.username, state: 1 }
      }

      utils.sendToSelf(socket, '$trevyro:Accounts:import:onStatusChange', data)

      const user = new UserSchema({
        username: addedUser.username,
        fullname: addedUser.fullname,
        email: addedUser.email,
        title: addedUser.title ? addedUser.title : null,
        password: 'Password1!'
      })

      const normalizedRole = addedUser.role ? addedUser.role : 'user'

      try {
        const role = await Role.findOne({ normalized: normalizedRole })
        if (!role) throw new Error('Invalid Role')

        user.role = role._id

        await user.save()
        completedCount++

        data.item.state = 2 // Completed
        setTimeout(() => {
          utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
        }, 150)
      } catch (err) {
        logger.warn(err)
        data.item.state = 3
        utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
      }
    }

    for (const updatedUser of updatedUsers) {
      const data = {
        type: 'csv',
        totalCount: addedUsers.length + updatedUsers.length,
        completedCount,
        item: {
          username: updatedUser.username,
          state: 1
        }
      }

      utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)

      try {
        const user = await UserSchema.getUserByUsername(updatedUser.username)
        user.fullname = updatedUser.fullname
        user.title = updatedUser.title
        user.email = updatedUser.email

        if (updatedUser.role) {
          const role = await Role.findOne({ normalized: updatedUser.role })
          if (!role) throw new Error('Invalid Role')
          user.role = role._id
        }

        await user.save()
        completedCount++
        data.item.state = 2
        data.completedCount = completedCount
        setTimeout(function () {
          utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
        }, 150)
      } catch (err) {
        logger.warn(err)
        data.item.state = 3
        utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
      }
    }
  })
}

events.onImportJSON = function (socket) {
  socket.on('$trevyro:accounts:import:json', function (data) {
    var authUser = socket.request.user
    if (!permissions.canThis(authUser.role, 'accounts:import')) {
      // Send Error Socket Emit
      logger.warn('[$trevyro:accounts:import:json] - Error: Invalid permissions.')
      utils.sendToSelf(socket, '$trevyro:accounts:import:error', {
        error: 'Invalid Permissions. Check Console.'
      })
      return
    }

    var addedUsers = data.addedUsers
    var updatedUsers = data.updatedUsers

    var completedCount = 0
    async.series(
      [
        function (next) {
          async.eachSeries(
            addedUsers,
            function (cu, done) {
              var data = {
                type: 'json',
                totalCount: addedUsers.length + updatedUsers.length,
                completedCount: completedCount,
                item: {
                  username: cu.username,
                  state: 1
                }
              }

              utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)

              var user = new UserSchema({
                username: cu.username,
                fullname: cu.fullname,
                email: cu.email,
                password: 'Password1!'
              })

              if (!_.isUndefined(cu.role)) {
                user.role = cu.role
              } else {
                user.role = 'user'
              }

              if (!_.isUndefined(cu.title)) {
                user.title = cu.title
              }

              user.save(function (err) {
                if (err) {
                  logger.warn(err)
                  data.item.state = 3
                  utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
                } else {
                  completedCount++
                  // Send update
                  data.completedCount = completedCount
                  data.item.state = 2 // Completed
                  setTimeout(function () {
                    utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)

                    done()
                  }, 150)
                }
              })
            },
            function () {
              return next()
            }
          )
        },
        function (next) {
          _.each(updatedUsers, function (uu) {
            var data = {
              type: 'json',
              totalCount: addedUsers.length + updatedUsers.length,
              completedCount: completedCount,
              item: {
                username: uu.username,
                state: 1 // Starting
              }
            }
            utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
            UserSchema.getUserByUsername(uu.username, function (err, user) {
              if (err) {
                console.log(err)
              } else {
                user.fullname = uu.fullname
                user.title = uu.title
                user.email = uu.email
                if (!_.isUndefined(uu.role)) {
                  user.role = uu.role
                }

                user.save(function (err) {
                  if (err) {
                    console.log(err)
                    data.item.state = 3
                    utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
                  } else {
                    completedCount++
                    data.item.state = 2
                    data.completedCount = completedCount
                    setTimeout(function () {
                      utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
                    }, 150)
                  }
                })
              }
            })
          })

          return next()
        }
      ],
      function () {}
    )
  })
}

events.onImportLDAP = function (socket) {
  socket.on('$trevyro:accounts:import:ldap', function (data) {
    const authUser = socket.request.user
    if (!permissions.canThis(authUser.role, 'accounts:import')) {
      // Send Error Socket Emit
      logger.warn('[$trevyro:accounts:import:ldap] - Error: Invalid permissions.')
      utils.sendToSelf(socket, '$trevyro:accounts:import:error', {
        error: 'Invalid Permissions. Check Console.'
      })
      return
    }

    const addedUsers = data.addedUsers
    const updatedUsers = data.updatedUsers
    let defaultUserRole = null
    let completedCount = 0

    async.series(
      [
        function (next) {
          var settingSchema = require('../models/setting')
          settingSchema.getSetting('role:user:default', function (err, setting) {
            if (err || !setting) {
              utils.sendToSelf(socket, '$trevyro:accounts:import:error', {
                error: 'Default user role not set. Please contact an Administrator.'
              })

              return next('Default user role not set. Please contact an Administrator')
            }

            defaultUserRole = setting.value
            return next()
          })
        },
        function (next) {
          async.eachSeries(
            addedUsers,
            function (lu, done) {
              var data = {
                type: 'ldap',
                totalCount: addedUsers.length + updatedUsers.length,
                completedCount: completedCount,
                item: {
                  username: lu.sAMAccountName,
                  state: 1 // Starting
                }
              }

              utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)

              var user = new UserSchema({
                username: lu.sAMAccountName,
                fullname: lu.displayName,
                email: lu.mail,
                title: lu.title,
                role: defaultUserRole,
                password: 'Password1!'
              })

              user.save(function (err) {
                if (err) {
                  logger.warn(err)
                  data.item.state = 3
                  utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
                } else {
                  completedCount++
                  // Send update
                  data.completedCount = completedCount
                  data.item.state = 2 // Completed
                  setTimeout(function () {
                    utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)

                    done()
                  }, 150)
                }
              })
            },
            function () {
              return next()
            }
          )
        },
        function (next) {
          _.each(updatedUsers, function (uu) {
            var data = {
              type: 'ldap',
              totalCount: addedUsers.length + updatedUsers.length,
              completedCount: completedCount,
              item: {
                username: uu.username,
                state: 1 // Starting
              }
            }
            utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
            UserSchema.getUser(uu._id, function (err, user) {
              if (err) {
                console.log(err)
              } else {
                user.fullname = uu.fullname
                user.title = uu.title
                user.email = uu.email

                user.save(function (err) {
                  if (err) {
                    console.log(err)
                    data.item.state = 3
                    utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
                  } else {
                    completedCount++
                    data.item.state = 2
                    data.completedCount = completedCount
                    setTimeout(function () {
                      utils.sendToSelf(socket, '$trevyro:accounts:import:onStatusChange', data)
                    }, 150)
                  }
                })
              }
            })
          })

          return next()
        }
      ],
      function () {}
    )
  })
}

module.exports = {
  events: events,
  eventLoop: eventLoop,
  register: register
}
