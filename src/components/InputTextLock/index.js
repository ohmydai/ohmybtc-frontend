import React from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import Padlock from './Padlock'
import { color } from '../../theme'
import MaxLabel from './MaxLabel'
import Loader from './Loader'

const StyledInput = styled.div`
  font-family: "AvenirNext-Regular", sans-serif;
  position: relative;
  width: 100%;

  input {
    background: transparent;
    border: none;
    border-bottom: 2px solid ${color.greenLight};
    color: ${color.greenLight};
    font-size: 25px; 
    line-height: 60px;
    outline: 0;
    padding: 5px;
    margin: 5px 0;
    width: 100%;
    
    &:disabled {
      border-bottom: 2px solid gray;
      opacity: 0.3;
    }
  }
`

const InputTextLock = ({
  value,
  placeholder,
  onChange,
  isUnlocked,
  onUnlock,
  isLoading,
  tooltipText,
  onMaxClick
}) => {
  return (
    <StyledInput data-tip={tooltipText} data-event='click focus'>
      <input
        disabled={!isUnlocked}
        type='text'
        placeholder={placeholder}
        value={value}
        onChange={handleChange(onChange)}
      />

      {typeof onMaxClick === 'function' && (
        <MaxLabel onClick={onMaxClick}>Max</MaxLabel>
      )}

      {isLoading && (
        <Loader />
      )}
      {!isUnlocked && !isLoading && (
        <Padlock onClick={onUnlock} />
      )}
      <ReactTooltip globalEventOff='click' place='right' type='success' />
    </StyledInput>
  )
}

InputTextLock.defaultProps = {
  onChange: () => null,
  onUnlock: () => null,
  placeholder: null
}

export default InputTextLock

function handleChange (onChange) {
  return e => {
    const value = e.target.value.replace(/\D/, '')
    if (Number.isNaN(parseInt(value))) {
      onChange('')
    } else {
      onChange(parseInt(value))
    }
  }
}
