#!/usr/bin/env node

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
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const dotenv = require('dotenv')
const Chance = require('chance')
const chance = new Chance()
const logger = require('./src/logger')
const pkg = require('./package.json')

// Load .env file
dotenv.config()

const isDocker = process.env.TRUDESK_DOCKER || true
global.forks = []
global.env = process.env.NODE_ENV || 'development'

let configFile = path.join(__dirname, '/config.yml')
if (process.env.CONFIG) {
  configFile = path.resolve(__dirname, process.env.CONFIG)
}

checkForOldConfig()

let config = {}
if (fs.existsSync(configFile)) {
  try {
    const configRaw = fs.readFileSync(configFile, 'utf8')
    config = yaml.load(configRaw) || {}
  } catch (err) {
    logger.error('Failed to load YAML config:', err)
  }
}

function getConfig(key, fallback = undefined) {
  return process.env[key.toUpperCase()] || config[key] || fallback
}
const banner = `
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ooooooooooooo                                                                 
 ≡  8'   888   \`8                                                                 
 ≡       888      oooo d8b  .ooooo.  oooo    ooo oooo    ooo oooo d8b  .ooooo.    
 ≡       888      \`888""8P d88' \`88b  \`88.  .8'   \`88.  .8'  \`888""8P d88' \`88b   
 ≡       888       888     888ooo888   \`88..8'     \`88..8'    888     888   888   
 ≡       888       888     888    .o    \`888'       \`888'     888     888   888   
 ≡      o888o     d888b    \`Y8bod8P'     \`8'         .8'     d888b    \`Y8bod8P'   
 ≡                                               .o..P'                           
 ≡                                               \`Y8P'                            
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
 ≡  ⟦ 🏷️ Project     ⟧  Trevyro
 ≡  ⟦ 👨‍💻 Author      ⟧  Sayyed Mohammad Adil
 ≡  ⟦ 📦 Version     ⟧  v${pkg.version}
 ≡  ⟦ 📅 Updated     ⟧  01/04/2025 • 00:00:00 AM
 ≡  ⟦ 🛡️ License     ⟧  © 2025-2026 All rights reserved
 ≡  ⟦ 🌍 Environment ⟧  ${global.env}
 ≡  ⟦ ⏰ Server Time ⟧  ${new Date().toISOString()}
 ≡  ══════════════════════════════════════◈═════════════════════════════════════
`;
if (!process.env.FORK) {
  logger.info(banner)
}

const configExists = fs.existsSync(configFile)
if (getConfig('install') || (!configExists && !isDocker)) {
  logger.info('Installing Trevyro...')
  launchInstallServer()
}

function checkForOldConfig() {
  const oldConfigFile = path.join(__dirname, '/config.json')
  if (fs.existsSync(oldConfigFile)) {
    const content = fs.readFileSync(oldConfigFile)
    const data = JSON.parse(content)
    fs.writeFileSync(configFile, yaml.dump(data))
    fs.renameSync(oldConfigFile, path.join(__dirname, '/config.json.bk'))
  }
}

function launchInstallServer() {
  config.tokens = {
    secret: chance.hash() + chance.md5()
  }

  const ws = require('./src/webserver')
  ws.installServer(function () {
    return logger.info('Trevyro Install Server Running...')
  })
}

function start() {
  if (!isDocker) {
    config.base_dir = __dirname
    config.tokens = config.tokens || {
      secret: chance.hash() + chance.md5(),
      expires: 900
    }
  } else {
    config.tokens = {
      secret: process.env.TRUDESK_JWTSECRET || chance.hash() + chance.md5(),
      expires: 900
    }
  }

  const _db = require('./src/database')
  _db.init(function (err, db) {
    if (err) {
      logger.error('FETAL: ' + err.message)
      logger.warn('Retrying to connect to MongoDB in 10secs...')
      return setTimeout(() => _db.init(dbCallback), 10000)
    } else {
      dbCallback(err, db)
    }
  })
}

function dbCallback(err, db) {
  if (err || !db) {
    return start()
  }

  if (isDocker) {
    const s = require('./src/models/setting')
    s.getSettingByName('installed', function (err, installed) {
      if (err) return start()
      logger.info('Trevyro is now listening on http://localhost:' + getConfig('port', 8118))
      if (!installed) return launchInstallServer()
      return launchServer(db)
    })
  } else {
    logger.info('Trevyro is now listening on http://localhost:' + getConfig('port', 8118))
    return launchServer(db)
  }
}

function launchServer(db) {
  const ws = require('./src/webserver')
  ws.init(db, function (err) {
    if (err) {
      logger.error(err)
      return
    }

    async.series(
      [
        function (next) {
          require('./src/settings/defaults').init(next)
        },
        function (next) {
          require('./src/permissions').register(next)
        },
        function (next) {
          require('./src/elasticsearch').init(function (err) {
            if (err) logger.error(err)
            return next()
          })
        },
        function (next) {
          require('./src/socketserver')(ws)
          return next()
        },
        function (next) {
          const settingSchema = require('./src/models/setting')
          settingSchema.getSetting('mailer:check:enable', function (err, mailCheckEnabled) {
            if (err) {
              logger.warn(err)
              return next(err)
            }

            if (mailCheckEnabled && mailCheckEnabled.value) {
              settingSchema.getSettings(function (err, settings) {
                if (err) return next(err)

                const mailCheck = require('./src/mailer/mailCheck')
                logger.debug('Starting MailCheck...')
                mailCheck.init(settings)

                return next()
              })
            } else {
              return next()
            }
          })
        },
        function (next) {
          require('./src/migration').run(next)
        },
        function (next) {
          logger.debug('Building dynamic sass...')
          require('./src/sass/buildsass').build(next)
        },
        function (next) {
          const cache = require('./src/cache/cache')
          if (isDocker) {
            cache.env = {
              TRUDESK_DOCKER: process.env.TRUDESK_DOCKER,
              TD_MONGODB_SERVER: process.env.TD_MONGODB_SERVER,
              TD_MONGODB_PORT: process.env.TD_MONGODB_PORT,
              TD_MONGODB_USERNAME: process.env.TD_MONGODB_USERNAME,
              TD_MONGODB_PASSWORD: process.env.TD_MONGODB_PASSWORD,
              TD_MONGODB_DATABASE: process.env.TD_MONGODB_DATABASE,
              TD_MONGODB_URI: process.env.TD_MONGODB_URI
            }
          }

          cache.init()
          return next()
        },
        function (next) {
          const taskRunner = require('./src/taskrunner')
          return taskRunner.init(next)
        }
      ],
      function (err) {
        if (err) throw new Error(err)
        ws.listen(() => logger.info('trevyro Ready'))
      }
    )
  })
}

if (!process.env.INSTALL && (configExists || isDocker)) {
  start()
}
