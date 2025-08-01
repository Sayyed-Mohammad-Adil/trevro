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

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { showModal, fetchRoles, updateRoleOrder } from 'actions/common'
import { updateSetting } from 'actions/settings'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import SingleSelect from 'components/SingleSelect'
import SplitSettingsPanel from 'components/Settings/SplitSettingsPanel'
import PermissionBody from './permissionBody'

import $ from 'jquery'

class PermissionsSettingsContainer extends React.Component {
  componentDidMount () {
    this.props.fetchRoles()
  }

  getSetting (name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  onRoleOrderChanged (e) {
    const children = $(e.target).children('li')
    const arr = []
    for (let i = 0; i < children.length; i++) arr.push($(children[i]).attr('data-key'))

    this.props.updateRoleOrder({ roleOrder: arr })
  }

  getRoleMenu () {
    if (this.props.roleOrder && this.props.roleOrder.get('order') && this.props.roles) {
      const menu = this.props.roleOrder.get('order').map(o => {
        return this.props.roles.find(v => {
          return v.get('_id') === o
        })
      })

      return menu.toArray()
    }

    return []
  }

  onCreateRoleClicked (e) {
    e.preventDefault()

    this.props.showModal('CREATE_ROLE')
  }

  onDefaultUserRoleChange (e) {
    this.props.updateSetting({ name: 'role:user:default', value: e.target.value, stateName: 'defaultUserRole' })
  }

  render () {
    const mappedRoles = this.props.roles
      .map(role => {
        return { text: role.get('name'), value: role.get('_id') }
      })
      .toArray()

    return (
      <div className={this.props.active ? '' : 'hide'}>
        <SettingItem
          title={'Default New User Role'}
          subtitle={'Role assigned to users created during sign-up and public tickets'}
          component={
            <SingleSelect
              items={mappedRoles}
              defaultValue={this.getSetting('defaultUserRole')}
              onSelectChange={e => {
                this.onDefaultUserRoleChange(e)
              }}
              width={'50%'}
              showTextbox={false}
            />
          }
        />
        <SplitSettingsPanel
          title={'Permissions'}
          tooltip={'Permission order is top down. ex: Admins at top; Users at bottom.'}
          subtitle={
            <div>
              Create/Modify Role Permissions{' '}
              <span className={'uk-text-danger'}>Note: Changes take affect after page refresh</span>
            </div>
          }
          rightComponent={
            <Button
              text={'Create'}
              style={'success'}
              flat={true}
              waves={true}
              onClick={e => this.onCreateRoleClicked(e)}
            />
          }
          menuItems={this.getRoleMenu().map(role => {
            return { key: role.get('_id'), title: role.get('name'), bodyComponent: <PermissionBody role={role} /> }
          })}
          menuDraggable={true}
          menuOnDrag={e => {
            this.onRoleOrderChanged(e)
          }}
        />
      </div>
    )
  }
}

PermissionsSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  roles: PropTypes.object.isRequired,
  roleOrder: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  fetchRoles: PropTypes.func.isRequired,
  updateRoleOrder: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  updateSetting: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  roles: state.shared.roles,
  roleOrder: state.shared.roleOrder,
  settings: state.settings.settings
})

export default connect(mapStateToProps, { fetchRoles, updateRoleOrder, showModal, updateSetting })(
  PermissionsSettingsContainer
)
