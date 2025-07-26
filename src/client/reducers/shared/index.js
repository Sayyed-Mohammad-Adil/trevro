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

import { handleActions } from 'redux-actions'
import { fromJS, List, Map } from 'immutable'

import {
  SET_SESSION_USER,
  FETCH_ROLES,
  UPDATE_ROLE_ORDER,
  SHOW_NOTICE,
  CLEAR_NOTICE,
  INIT_SOCKET,
  GEN_MFA
} from 'actions/types'

const initialState = {
  sessionUser: null,
  mfa: Map({}),
  roles: List([]),
  roleOrder: Map({}),
  notice: null,
  loadingViewData: true,
  viewdata: Map({}),

  socket: {},
  socketInitialized: false
}

const sharedReducer = handleActions(
  {
    [INIT_SOCKET.SUCCESS]: (state, action) => {
      if (state.socketInitialized)
        return {
          ...state
        }

      return {
        ...state,
        socket: action.payload.socket,
        socketInitialized: true
      }
    },

    [SET_SESSION_USER.SUCCESS]: (state, action) => {
      return {
        ...state,
        sessionUser: action.payload.sessionUser
      }
    },

    [GEN_MFA.SUCCESS]: (state, action) => {
      return {
        ...state,
        mfa: fromJS(action.payload)
      }
    },

    [SHOW_NOTICE]: (state, action) => {
      return {
        ...state,
        notice: fromJS(action.payload)
      }
    },

    [CLEAR_NOTICE]: state => {
      return {
        ...state,
        notice: null
      }
    },

    [FETCH_ROLES.SUCCESS]: (state, action) => {
      return {
        ...state,
        roles: fromJS(action.response.roles),
        roleOrder: fromJS(action.response.roleOrder)
      }
    },

    [UPDATE_ROLE_ORDER.SUCCESS]: (state, action) => {
      return {
        ...state,
        roleOrder: fromJS(action.response.roleOrder)
      }
    }
  },
  initialState
)

export default sharedReducer
