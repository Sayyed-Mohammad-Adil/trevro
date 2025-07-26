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

var mongoose = require('mongoose')
var _ = require('lodash')

var COLLECTION = 'notification'

// Types
// Type 0 : Green Check
// Type 1 : Warning
// Type 2 : Red Exclamation

var notificationSchema = mongoose.Schema({
  created: { type: Date, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'accounts' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: Number,
  data: Object,
  unread: { type: Boolean, default: true }
})

notificationSchema.methods.markRead = function (callback) {
  this.unread = false

  return callback(null, true)
}

notificationSchema.statics.getNotification = function (id, callback) {
  if (_.isUndefined(id)) {
    return callback('Invalid ObjectId - NotificationSchema.GetNotification()', null)
  }

  return this.model(COLLECTION).findOne({ _id: id }, callback)
}

notificationSchema.statics.findAllForUser = function (oId, callback) {
  if (_.isUndefined(oId)) {
    return callback('Invalid ObjectId - NotificationSchema.FindAllForUser()', null)
  }

  var q = this.model(COLLECTION)
    .find({ owner: oId })
    .sort({ created: -1 })
    .limit(100)

  return q.exec(callback)
}

notificationSchema.statics.getForUserWithLimit = function (oId, callback) {
  if (_.isUndefined(oId)) return callback('Invalid ObjectId - NotificationSchema.GetForUserWithLimit()', null)

  return this.model(COLLECTION)
    .find({ owner: oId })
    .sort({ created: -1 })
    .limit(5)
    .exec(callback)
}

notificationSchema.statics.getCount = function (oId, callback) {
  if (_.isUndefined(oId)) {
    return callback('Invalid ObjectId - NotificationSchema.GetCount()', null)
  }

  return this.model(COLLECTION).countDocuments({ owner: oId }, callback)
}

notificationSchema.statics.getUnreadCount = function (oId, callback) {
  if (_.isUndefined(oId)) {
    return callback('Invalid ObjectId - NotificationSchema.GetUnreadCount()', null)
  }

  return this.model(COLLECTION).countDocuments({ owner: oId, unread: true }, callback)
}

notificationSchema.statics.clearNotifications = function (oId, callback) {
  if (_.isUndefined(oId)) {
    return callback('Invalid UserId - NotificationSchema.ClearNotifications()', null)
  }

  return this.model(COLLECTION).deleteMany({ owner: oId }, callback)
}

module.exports = mongoose.model(COLLECTION, notificationSchema)
