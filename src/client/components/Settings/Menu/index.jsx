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

import $ from 'jquery'
import UIkit from 'uikit'

class Menu extends React.Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    if (this.props.draggable) {
      const menu = $(this.menu)
      this.menuSortable = UIkit.sortable(menu, {
        handleClass: 'drag-handle'
      })

      if (this.props.onMenuDrag) this.menuSortable.on('change.uk.sortable', this.props.onMenuDrag)
    }
  }

  componentDidUpdate () {
    if (this.props.draggable && !this.menuSortable) {
      const menu = $(this.menu)
      this.menuSortable = UIkit.sortable(menu, {
        handleClass: 'drag-handle'
      })

      if (this.props.onMenuDrag) this.menuSortable.on('change.uk.sortable', this.props.onMenuDrag)
    }
  }

  render () {
    const { hideBorders } = this.props
    return (
      <ul
        ref={i => (this.menu = i)}
        className={'settings-categories scrollable' + (hideBorders ? ' noborder ' : '')}
        style={{ overflow: 'hidden auto' }}
      >
        {this.props.children}
      </ul>
    )
  }
}

Menu.propTypes = {
  hideBorders: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  draggable: PropTypes.bool,
  onMenuDrag: PropTypes.func
}

Menu.defaultProps = {
  draggable: false
}

export default Menu
