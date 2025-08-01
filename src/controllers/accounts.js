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
const logger = require('../logger')
const userSchema = require('../models/user')
const permissions = require('../permissions')
const emitter = require('../emitter')
const xss = require('xss')
const path = require('path')

const accountsController = {}

accountsController.content = {}

function handleError (res, err) {
  if (err) {
    return res.render('error', {
      layout: false,
      error: err,
      message: err.message
    })
  }
}

accountsController.signup = function (req, res) {
  const marked = require('marked')
  const settings = require('../models/setting')
  settings.getSettingByName('allowUserRegistration:enable', function (err, setting) {
    if (err) return handleError(res, err)
    if (setting && setting.value === true) {
      settings.getSettingByName('legal:privacypolicy', function (err, privacyPolicy) {
        if (err) return handleError(res, err)

        const content = {}
        content.title = 'Create Account'
        content.layout = false
        content.data = {}

        if (privacyPolicy === null || _.isUndefined(privacyPolicy.value)) {
          content.data.privacyPolicy = 'No Privacy Policy has been set.'
        } else {
          content.data.privacyPolicy = xss(marked.parse(privacyPolicy.value))
        }

        return res.render('pub_signup', content)
      })
    } else {
      return res.redirect('/')
    }
  })
}

accountsController.get = function (req, res) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'accounts:view')) {
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Accounts'
  content.nav = 'accounts'

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata

  return res.render('accounts', content)
}

accountsController.getCustomers = function (req, res) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'accounts:view')) {
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Customers'
  content.nav = 'accounts'
  content.subnav = 'accounts-customers'

  content.data = {}
  content.data.user = user
  content.data.common = req.viewdata
  content.data.view = 'customers'

  return res.render('accounts', content)
}

accountsController.getAgents = function (req, res) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'accounts:view')) {
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Agents'
  content.nav = 'accounts'
  content.subnav = 'accounts-agents'

  content.data = {}
  content.data.user = user
  content.data.common = req.viewdata
  content.data.view = 'agents'

  return res.render('accounts', content)
}

accountsController.getAdmins = function (req, res) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'accounts:view')) {
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Admins'
  content.nav = 'accounts'
  content.subnav = 'accounts-admins'

  content.data = {}
  content.data.user = user
  content.data.common = req.viewdata
  content.data.view = 'admins'

  return res.render('accounts', content)
}

accountsController.importPage = function (req, res) {
  const user = req.user
  if (_.isUndefined(user) || !permissions.canThis(user.role, 'accounts:import')) {
    return res.redirect('/')
  }

  const content = {}
  content.title = 'Accounts - Import'
  content.nav = 'accounts'

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata

  res.render('accounts_import', content)
}

accountsController.profile = function (req, res) {
  const user = req.user
  const backUrl = req.header('Referer') || '/'
  if (_.isUndefined(user)) {
    req.flash('message', 'Permission Denied.')
    logger.warn('Undefined User - /Profile')
    return res.redirect(backUrl)
  }

  const content = {}
  content.title = 'Profile'
  content.nav = 'profile'

  content.data = {}
  content.data.user = req.user
  content.data.common = req.viewdata
  content.data.host = req.hostname
  content.data.account = {}

  async.parallel(
    {
      account: function (callback) {
        userSchema.findOne({ _id: req.user._id }, '+accessToken +tOTPKey', function (err, obj) {
          callback(err, obj)
        })
      }
    },
    function (err, result) {
      if (err) {
        logger.warn(err)
        return res.redirect(backUrl)
      }

      content.data.account = result.account

      res.render('subviews/profile', content)
    }
  )
}

accountsController.bindLdap = function (req, res) {
  const ldap = require('../ldap')
  const postData = req.body
  if (_.isUndefined(postData)) return res.status(400).json({ success: false, error: 'Invalid Post Data.' })

  const server = postData['ldap-server']
  const dn = postData['ldap-bind-dn']
  const password = postData['ldap-password']
  const searchBase = postData['ldap-search-base']
  const filter = postData['ldap-filter']

  ldap.bind('ldap://' + server, dn, password, function (err) {
    if (err && !res.headersSent) return res.status(400).json({ success: false, error: err })

    ldap.search(searchBase, filter, function (err, results) {
      if (err && !res.headersSent) return res.status(400).json({ success: false, error: err })
      if (_.isUndefined(results)) return res.status(400).json({ success: false, error: 'Undefined Results' })

      const entries = results.entries
      let foundUsers = null
      ldap.unbind(function (err) {
        if (err && !res.headersSent) return res.status(400).json({ success: false, error: err })

        let mappedUsernames = _.map(entries, 'sAMAccountName')

        userSchema.find({ username: mappedUsernames }, function (err, users) {
          if (err && !res.headersSent) return res.status(400).json({ success: false, error: err })

          foundUsers = users

          mappedUsernames = _.map(foundUsers, 'username')

          _.each(mappedUsernames, function (mappedUsername) {
            const u = _.find(entries, function (f) {
              return f.sAMAccountName.toLowerCase() === mappedUsername.toLowerCase()
            })

            if (u) {
              let clonedUser = _.find(foundUsers, function (g) {
                return g.username.toLowerCase() === u.sAMAccountName.toLowerCase()
              })
              if (clonedUser) {
                clonedUser = _.clone(clonedUser)
                clonedUser.fullname = u.displayName
                clonedUser.email = u.mail
                clonedUser.title = u.title
              }
            }

            _.remove(entries, function (k) {
              return k.sAMAccountName.toLowerCase() === mappedUsername.toLowerCase()
            })
          })

          _.remove(entries, function (e) {
            return _.isUndefined(e.mail)
          })

          return res.json({
            success: true,
            addedUsers: entries,
            updatedUsers: foundUsers
          })
        })
      })
    })
  })
}

function processUsers (addedUserArray, updatedUserArray, item, callback) {
  userSchema.getUserByUsername(item.username, function (err, user) {
    if (err) return callback(err)

    if (user) {
      updatedUserArray.push(item)
    } else {
      addedUserArray.push(item)
    }

    return callback()
  })
}

accountsController.uploadCSV = function (req, res) {
  const csv = require('fast-csv')
  const Busboy = require('busboy')
  const busboy = Busboy({
    headers: req.headers,
    limits: {
      files: 1
    }
  })

  const object = {}

  const parser = csv.parse()

  busboy.on('file', function (name, file, info) {
    object.csv = []

    file
      .on('readable', function () {
        let data
        while ((data = file.read()) !== null) {
          parser.write(data)
        }
      })
      .on('end', function () {
        parser.end()
      })
  })

  busboy.on('error', function (err) {
    res.status(400).json({ success: false, error: err })
  })

  parser
    .on('data', function (row) {
      object.csv.push(row)
    })
    .on('end', function () {
      if (object.csv.length < 1) {
        return res.json({ success: false, error: 'Invalid CSV. No title Row.' })
      }

      const titleRow = object.csv[0]
      const usernameIdx = _.findIndex(titleRow, function (i) {
        return i.toLowerCase() === 'username'
      })
      const fullnameIdx = _.findIndex(titleRow, function (i) {
        return i.toLowerCase() === 'name'
      })
      const emailIdx = _.findIndex(titleRow, function (i) {
        return i.toLowerCase() === 'email'
      })
      const titleIdx = _.findIndex(titleRow, function (i) {
        return i.toLowerCase() === 'title'
      })
      const roleIdx = _.findIndex(titleRow, function (i) {
        return i.toLowerCase() === 'role'
      })

      object.csv.splice(0, 1)

      // Left with just the data for the import; Lets map that to an array of usable objects.
      object.csv = _.map(object.csv, function (item) {
        return _.assign(
          { username: item[usernameIdx] },
          { fullname: item[fullnameIdx] },
          { email: item[emailIdx] },
          { title: item[titleIdx] },
          { role: item[roleIdx] }
        )
      })

      const addedUsers = []
      const updatedUsers = []

      async.each(
        object.csv,
        function (item, next) {
          return processUsers(addedUsers, updatedUsers, item, next)
        },
        function (err) {
          if (err) {
            logger.warn(err.message)
            return res.json({ success: false, error: err })
          }

          return res.json({
            success: true,
            contents: object.csv,
            addedUsers: addedUsers,
            updatedUsers: updatedUsers
          })
        }
      )
    })

  req.pipe(busboy)
}

accountsController.uploadJSON = function (req, res) {
  const Busboy = require('busboy')
  const busboy = new Busboy({
    headers: req.headers,
    limits: {
      files: 1
    }
  })

  const addedUsers = []

  const updatedUsers = []

  const object = {}
  let error
  busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
    if (mimetype.indexOf('application/json') === -1) {
      error = {
        status: 400,
        message: 'Invalid File Type'
      }

      return file.resume()
    }
    let buffer = ''
    file.on('data', function (data) {
      buffer += data
    })

    file
      .on('end', function () {
        object.json = JSON.parse(buffer)
        const accounts = object.json.accounts
        if (_.isUndefined(accounts)) {
          return res.status(400).json({
            success: false,
            error: 'No accounts defined in JSON file.'
          })
        }

        async.eachSeries(
          accounts,
          function (item, next) {
            return processUsers(addedUsers, updatedUsers, item, next)
          },
          function (err) {
            if (err) {
              return res.status(400).json({ success: false, error: err })
            }

            return res.json({
              success: true,
              contents: object.json,
              addedUsers: addedUsers,
              updatedUsers: updatedUsers
            })
          }
        )
      })
      .setEncoding('utf8')
  })

  busboy.on('error', function (err) {
    return res.status(400).json({ success: false, error: err })
  })

  busboy.on('finish', function () {
    if (error) {
      return res.status(error.status).json({ success: false, error: error })
    }
  })

  req.pipe(busboy)
}

accountsController.uploadImage = function (req, res) {
  const fs = require('fs')
  const path = require('path')
  const Busboy = require('busboy')
  const busboy = Busboy({
    headers: req.headers,
    limits: {
      files: 1,
      fileSize: 1024 * 1024 * 3 // 3mb limit
    }
  })

  const allowedExts = ['.png', '.jpg', '.jpeg', '.gif']

  const object = {}
  let error

  busboy.on('field', function (fieldname, val) {
    if (fieldname === '_id') object._id = val
    if (fieldname === 'username') object.username = val
  })

  busboy.on('file', function (name, file, info) {
    const filename = info.filename
    const mimetype = info.mimeType
    const ext = path.extname(filename)

    if (!allowedExts.includes(ext)) {
      error = {
        status: 400,
        message: 'Invalid File Type'
      }

      return file.resume()
    }

    const savePath = path.join(__dirname, '../../public/uploads/users')
    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath)

    object.filename = 'aProfile_' + object.username + path.extname(filename)
    object.filename = object.filename.replace('/', '').replace('..', '')
    object.filePath = path.join(savePath, object.filename)
    object.mimetype = mimetype

    file.on('limit', function () {
      error = {
        status: 400,
        message: 'File too large'
      }

      // Delete the temp file
      // if (fs.existsSync(object.filePath)) fs.unlinkSync(object.filePath);

      return file.resume()
    })

    file.pipe(fs.createWriteStream(object.filePath))
  })

  busboy.once('finish', function () {
    if (error) {
      logger.warn(error)
      return res.status(error.status).send(error.message)
    }

    if (
      _.isUndefined(object._id) ||
      _.isUndefined(object.username) ||
      _.isUndefined(object.filePath) ||
      _.isUndefined(object.filename)
    ) {
      return res.status(400).send('Invalid Form Data')
    }

    // Everything Checks out lets make sure the file exists and then add it to the attachments array
    if (!fs.existsSync(object.filePath)) return res.status(400).send('File Failed to Save to Disk')
    if (path.extname(object.filename) === '.jpg' || path.extname(object.filename) === '.jpeg') {
      require('../helpers/utils').stripExifData(object.filePath)
    }

    userSchema.getUser(object._id, function (err, user) {
      if (err) return handleError(res, err)

      user.image = object.filename

      user.save(function (err) {
        if (err) return handleError(res, err)

        emitter.emit('trevyro:profileImageUpdate', {
          userid: user._id,
          img: user.image
        })

        return res.status(200).send('/uploads/users/' + object.filename)
      })
    })
  })

  req.pipe(busboy)
}

module.exports = accountsController
