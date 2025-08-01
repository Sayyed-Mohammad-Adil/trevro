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
import clsx from 'clsx'
import $ from 'jquery'
import helpers from 'lib/helpers'

class ColorSelector extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedColor: ''
    }
  }

  static getRandomColor () {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)]

    return color
  }

  static getContrast (hexcolor) {
    hexcolor = hexcolor.replace('#', '')
    if (hexcolor.length === 3) {
      const v = hexcolor[0]
      hexcolor = hexcolor + v + v + v
    }
    const r = parseInt(hexcolor.substr(0, 2), 16)
    const g = parseInt(hexcolor.substr(2, 2), 16)
    const b = parseInt(hexcolor.substr(4, 2), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 128 ? '#444' : '#f7f8fa'
  }

  componentDidMount () {
    helpers.UI.inputs()
    this.setState({ selectedColor: this.props.defaultColor }, this.updateColorButton)
  }

  componentDidUpdate (prevProps) {
    if (this.props.defaultColor !== prevProps.defaultColor)
      this.setState(
        {
          selectedColor: this.props.defaultColor
        },
        this.updateColorButton
      )
  }

  generateRandomColor (event) {
    event.preventDefault()
    const $currentTarget = $(event.target)
    if ($currentTarget.length > 0) {
      const color = ColorSelector.getRandomColor()
      if (this.props.onChange) {
        event.target.value = color
        this.props.onChange(event)
      }
      this.setState(
        {
          selectedColor: color
        },
        () => {
          this.updateColorButton()
        }
      )
    }
  }

  updateColorButton () {
    const fgColor = ColorSelector.getContrast(this.state.selectedColor.substring(1))
    $(this.colorButton).css({ background: this.state.selectedColor, color: fgColor })
  }

  onInputValueChange (e) {
    const val = e.target.value
    if (this.props.onChange) this.props.onChange(e)

    this.setState(
      {
        selectedColor: val
      },
      this.updateColorButton
    )
  }

  revertColor () {
    this.setState(
      {
        selectedColor: this.props.defaultColor
      },
      this.updateColorButton
    )
  }

  render () {
    return (
      <div
        className={this.props.parentClass}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}
      >
        <div style={{ display: 'flex', width: '100%' }}>
          <button
            ref={colorButton => {
              this.colorButton = colorButton
            }}
            className='uk-button uk-button-small uk-color-button mr-15 mt-10'
            style={{ width: 37, height: 37 }}
            onClick={e => {
              this.generateRandomColor(e)
            }}
          >
            <i className='material-icons'>refresh</i>
          </button>
          <div className='md-input-wrapper md-input-filled' style={{ width: '100%' }}>
            {this.props.showLabel && <label>Color</label>}
            {this.props.validationEnabled && (
              <input
                name={this.props.inputName ? this.props.inputName : ''}
                type='text'
                className='md-input'
                value={this.state.selectedColor}
                onChange={e => {
                  this.onInputValueChange(e)
                }}
                data-validation='custom'
                data-validation-regexp='^\#([0-9a-fA-F]){3,6}$'
                data-validation-error-msg='Invalid HEX Color'
              />
            )}
            {!this.props.validationEnabled && (
              <input
                name={this.props.inputName ? this.props.inputName : ''}
                type='text'
                className='md-input'
                value={this.state.selectedColor}
                onChange={e => {
                  this.onInputValueChange(e)
                }}
              />
            )}
            <div className='md-input-bar' />
          </div>
        </div>
        {!this.props.hideRevert && (
          <button
            type={'button'}
            className={'md-btn md-btn-small md-btn-flat ml-10 mt-10'}
            onClick={() => {
              this.revertColor()
            }}
          >
            Revert
          </button>
        )}
      </div>
    )
  }
}

ColorSelector.propTypes = {
  inputName: PropTypes.string,
  defaultColor: PropTypes.string.isRequired,
  showLabel: PropTypes.bool,
  hideRevert: PropTypes.bool,
  parentClass: PropTypes.string,
  onChange: PropTypes.func,
  validationEnabled: PropTypes.bool
}

ColorSelector.defaultProps = {
  defaultColor: '#878982',
  hideRevert: false,
  validationEnabled: false,
  showLabel: true
}

export default ColorSelector
