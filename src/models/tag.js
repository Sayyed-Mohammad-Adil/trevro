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
var utils = require('../helpers/utils')

var COLLECTION = 'tags'

/**
 * Tag Schema
 * @module models/tag
 * @class Tag

 *
 * @property {object} _id ```Required``` ```unique``` MongoDB Object ID
 * @property {String} name ```Required``` ```unique``` Name of Tag
 */
var tagSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  normalized: String
})

tagSchema.pre('save', function (next) {
  this.name = utils.sanitizeFieldPlainText(this.name.trim())
  this.normalized = utils.sanitizeFieldPlainText(this.name.toLowerCase().trim())

  return next()
})

tagSchema.statics.getTag = function (id, callback) {
  var q = this.model(COLLECTION).findOne({ _id: id })

  return q.exec(callback)
}

/**
 * Return all Tags
 *
 * @memberof Tag
 * @static
 * @method getTags
 *
 * @param {QueryCallback} callback MongoDB Query Callback
 */
tagSchema.statics.getTags = function (callback) {
  var q = this.model(COLLECTION)
    .find({})
    .sort('normalized')

  return q.exec(callback)
}

tagSchema.statics.getTagsWithLimit = function (limit, page, callback) {
  var q = this.model(COLLECTION)
    .find({})
    .sort('normalized')

  if (limit !== -1) {
    q.limit(limit).skip(page * limit)
  }

  return q.exec(callback)
}

tagSchema.statics.getTagByName = function (tagName, callback) {
  var q = this.model(COLLECTION)
    .find({ name: tagName })
    .limit(1)

  return q.exec(callback)
}

tagSchema.statics.tagExist = function (tagName, callback) {
  var q = this.model(COLLECTION).countDocuments({ name: tagName })

  return q.exec(callback)
}

tagSchema.statics.getTagCount = function (callback) {
  var q = this.model(COLLECTION)
    .countDocuments({})
    .lean()

  return q.exec(callback)
}

module.exports = mongoose.model(COLLECTION, tagSchema)
