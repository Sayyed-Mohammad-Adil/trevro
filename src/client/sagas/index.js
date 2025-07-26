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

import { all } from 'redux-saga/effects'
import CommonSaga from './common'
import DashboardSaga from './dashboard'
import SettingsSaga from './settings'
import TicketSaga from './tickets'
import AccountSaga from './accounts'
import GroupSaga from './groups'
import TeamSaga from './teams'
import DepartmentSaga from './departments'
import NoticeSage from './notices'
import SearchSaga from './search'
import MessagesSaga from './messages'
import ReportsSaga from './reports'

export default function * IndexSagas () {
  yield all([
    CommonSaga(),
    DashboardSaga(),
    TicketSaga(),
    SettingsSaga(),
    AccountSaga(),
    GroupSaga(),
    TeamSaga(),
    DepartmentSaga(),
    NoticeSage(),
    SearchSaga(),
    MessagesSaga(),
    ReportsSaga()
  ])
}
