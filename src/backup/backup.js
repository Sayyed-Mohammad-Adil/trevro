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

const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const spawn = require('child_process').spawn
const archiver = require('archiver')
const database = require('../database')
const logger = require('../logger')
const moment = require('moment')
const pkg = require('../../package.json')

global.env = process.env.NODE_ENV || 'production'

let CONNECTION_URI = null
let FILENAME = null

function createZip (callback) {
  const filename = FILENAME
  const output = fs.createWriteStream(path.join(__dirname, '../../backups/', filename))
  const archive = archiver('zip', {
    zlib: { level: 9 }
  })

  output.on('close', callback)
  output.on('end', callback)

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      logger.warn(err)
    } else {
      logger.error(err)
      return callback(err)
    }
  })

  archive.on('error', callback)

  archive.pipe(output)
  archive.directory(path.join(__dirname, '../../backups/dump/'), false)

  archive.finalize()
}

function cleanup (callback) {
  const rimraf = require('rimraf')
  rimraf(path.join(__dirname, '../../backups/dump'), callback)
}

function copyFiles (callback) {
  // Make sure the directories are created for the backup.
  fs.ensureDirSync(path.join(__dirname, '../../public/uploads/assets'))
  fs.ensureDirSync(path.join(__dirname, '../../public/uploads/tickets'))
  fs.ensureDirSync(path.join(__dirname, '../../public/uploads/users'))

  fs.copy(path.join(__dirname, '../../public/uploads/'), path.join(__dirname, '../../backups/dump/'), callback)
}

function runBackup (callback) {
  const platform = os.platform()
  logger.info('Starting backup... (' + platform + ')')

  let mongodumpExec = 'mongodump'
  if (platform === 'win32') {
    mongodumpExec = path.join(__dirname, 'bin/win32/mongodump')
  }

  const options = [
    '--uri',
    CONNECTION_URI,
    '--forceTableScan',
    '--out',
    path.join(__dirname, '../../backups/dump/database/')
  ]
  const mongodump = spawn(mongodumpExec, options, { env: { PATH: process.env.PATH } })

  mongodump.stdout.on('data', function (data) {
    logger.debug(data.toString())
  })

  mongodump.stderr.on('data', function (data) {
    logger.debug(data.toString())
  })

  mongodump.on('error', function (err) {
    logger.error(err)
    return callback(err.message)
  })

  mongodump.on('exit', function (code) {
    if (code === 0) {
      const dbName = fs.readdirSync(path.join(__dirname, '../../backups/dump/database'))[0]
      if (!dbName) {
        return callback(new Error('Unable to retrieve database name'))
      }

      require('rimraf')(path.join(__dirname, '../../backups/dump/database', dbName, 'session*'), function (err) {
        if (err) return callback(err)

        copyFiles(function (err) {
          if (err) return callback(err)
          createZip(function (err) {
            if (err) return callback(err)
            cleanup(callback)
          })
        })
      })
    } else {
      callback(new Error('MongoDump failed with code ' + code))
    }
  })
}

;(function () {
  CONNECTION_URI = process.env.MONGOURI
  FILENAME = process.env.FILENAME || 'trevyro-v' + pkg.version + '-' + moment().format('MMDDYYYY_HHmm') + '.zip'

  if (!CONNECTION_URI) return process.send({ error: { message: 'Invalid connection uri' } })
  const options = {
    keepAlive: false,
    connectTimeoutMS: 5000
  }
  database.init(
    function (e, db) {
      if (e) {
        process.send({ success: false, error: e })
        return process.kill(0)
      }

      if (!db) {
        process.send({
          success: false,
          error: { message: 'Unable to open database' }
        })
        return process.kill(0)
      }

      // Cleanup any leftovers
      cleanup(function (err) {
        if (err) return process.send({ success: false, error: err })

        runBackup(function (err) {
          if (err) return process.send({ success: false, error: err })

          logger.info('Backup completed successfully: ' + FILENAME)
          process.send({ success: true })
        })
      })
    },
    CONNECTION_URI,
    options
  )
})()
