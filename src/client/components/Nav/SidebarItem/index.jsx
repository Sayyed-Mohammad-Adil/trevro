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

import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Helpers from 'modules/helpers'

// import './style.sass';

class NavButton extends Component {
  constructor (props) {
    super(props)
  }

  componentDidUpdate () {
    Helpers.UI.bindAccordion()
    Helpers.UI.tetherUpdate()
  }

  renderAnchorLink () {
    return (
      <a href={this.props.href} className={this.props.class} target={this.props.target || ''}>
        <i className='material-icons'>{this.props.icon}</i>
        {this.props.text}
      </a>
    )
  }

  render () {
    if (this.props.hasSubmenu) {
      return (
        <li
          className={'hasSubMenu' + (this.props.active ? ' active' : '')}
          data-nav-id={this.props.subMenuTarget}
          data-nav-accordion
          data-nav-accordion-target={'side-nav-accordion-' + this.props.subMenuTarget}
        >
          {this.renderAnchorLink()}
          {this.props.children}
        </li>
      )
    } else {
      return (
        <li className={this.props.active ? ' active ' : ''}>
          {this.renderAnchorLink()}
          {this.props.children}
        </li>
      )
    }
  }
}

NavButton.propTypes = {
  href: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  class: PropTypes.string,
  hasSubmenu: PropTypes.bool,
  subMenuTarget: PropTypes.string,
  active: PropTypes.bool,
  target: PropTypes.string,
  children: PropTypes.node
}

export default NavButton
