import React from 'react'
import styled from 'styled-components'

const StyledButton = styled.button`
  background-color: #60bd56;
  border-radius: 25px;
  border-style: none;
  color: white;
  font-family: "AvenirNext-Regular", sans-serif;
  display: inline-block;
  margin: 0 4px;
  min-width: 90px;
  padding: 5px;
  
  ${props => props.size === 'large' && 'padding: 15px 20px'}
`

const ConfirmButton = ({ children, size, ...props }) => {
  return (
    <StyledButton size={size} {...props}>
      {children}
    </StyledButton>
  )
}

export default ConfirmButton
