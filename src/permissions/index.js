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
const logger = require('../logger')
const roleSchema = require('../models/role')
const roleOrder = require('../models/roleorder')

const register = function (callback) {
  // Register Roles
  roleSchema.getRolesLean(function (err, roles) {
    if (err) return callback(err)

    roleOrder.getOrderLean(function (err, ro) {
      if (err) return callback(err)

      logger.debug('Registering Permissions...')
      global.roleOrder = ro
      global.roles = roles

      return callback()
    })
  })
}

/***
 * Checks to see if a role as the given action
 * @param role [role to check against]
 * @param a [action to check]
 * @param adminOverride [override if admin]
 * @returns {boolean}
 */

const canThis = function (role, a, adminOverride = false) {
  if (_.isUndefined(role)) return false
  if (adminOverride === true && role.isAdmin) return true

  const roles = global.roles
  if (_.isUndefined(roles)) return false
  if (_.hasIn(role, '_id')) role = role._id
  const rolePerm = _.find(roles, { _id: role })
  if (_.isUndefined(rolePerm)) return false
  if (_.indexOf(rolePerm.grants, '*') !== -1) return true

  const actionType = a.split(':')[0]
  const action = a.split(':')[1]

  if (_.isUndefined(actionType) || _.isUndefined(action)) return false

  const result = _.filter(rolePerm.grants, function (value) {
    if (_.startsWith(value, actionType + ':')) return value
  })

  if (_.isUndefined(result) || _.size(result) < 1) return false
  if (_.size(result) === 1) {
    if (result[0] === '*') return true
  }

  let typePerm = result[0].split(':')[1].split(' ')
  typePerm = _.uniq(typePerm)

  if (_.indexOf(typePerm, '*') !== -1) return true

  return _.indexOf(typePerm, action) !== -1
}

const getRoles = function (action) {
  if (_.isUndefined(action)) return false

  let rolesWithAction = []
  const roles = global.roles
  if (_.isUndefined(roles)) return []

  _.each(roles, function (role) {
    const actionType = action.split(':')[0]
    const theAction = action.split(':')[1]

    if (_.isUndefined(actionType) || _.isUndefined(theAction)) return
    if (_.indexOf(role.grants, '*') !== -1) {
      rolesWithAction.push(role)
      return
    }

    const result = _.filter(role.grants, function (value) {
      if (_.startsWith(value, actionType + ':')) return value
    })

    if (_.isUndefined(result) || _.size(result) < 1) return
    if (_.size(result) === 1) {
      if (result[0] === '*') {
        rolesWithAction.push(role)
        return
      }
    }

    let typePerm = result[0].split(':')[1].split(' ')
    typePerm = _.uniq(typePerm)

    if (_.indexOf(typePerm, '*') !== -1) {
      rolesWithAction.push(role)
      return
    }

    if (_.indexOf(typePerm, theAction) !== -1) {
      rolesWithAction.push(role)
    }
  })

  rolesWithAction = _.uniq(rolesWithAction)

  return rolesWithAction
}

function hasHierarchyEnabled (roleId) {
  const role = _.find(global.roles, function (o) {
    return o._id.toString() === roleId.toString()
  })
  if (_.isUndefined(role) || _.isUndefined(role.hierarchy)) return true
  return role.hierarchy
}

function parseRoleHierarchy (roleId) {
  const roleOrder = global.roleOrder.order

  const idx = _.findIndex(roleOrder, function (i) {
    return i.toString() === roleId.toString()
  })
  if (idx === -1) return []

  return _.slice(roleOrder, idx)
}

function hasPermOverRole (ownRole, extRole) {
  const roles = parseRoleHierarchy(extRole)

  const i = _.find(roles, function (o) {
    return o.toString() === ownRole.toString()
  })

  return !_.isUndefined(i)
}

function isAdmin (roleId, callback) {
  roleSchema.get(roleId, function (err, role) {
    if (err) return callback(false)

    return callback(role.isAdmin)
  })
}

function isAdminSync (roleId) {
  const roles = global.roles
  if (!roles) return false
  const role = _.find(roles, function (r) {
    return r._id.toString() === roleId.toString()
  })

  if (!role) return false

  return role.isAdmin
}

function buildGrants (obj) {
  return _.map(obj, function (v, k) {
    return k + ':' + _.join(v, ' ')
  })
}

module.exports = {
  register,
  flushRoles: register,
  canThis,
  hasHierarchyEnabled,
  parseRoleHierarchy,
  hasPermOverRole,

  getRoles,
  isAdmin,
  isAdminSync,
  buildGrants
}
