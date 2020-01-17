import React from 'react'
import styled from 'styled-components'

const StepperTitle = styled.h3`
  padding-left: 34px;
`

const StepperList = styled.ul`
  padding: 0;
  list-style: none;
`

export const StepperContext = React.createContext({})

const Stepper = ({ children, title, currentStep, failed }) => {
  return (
    <StepperContext.Provider value={{ currentStep, failed }}>
      <StepperTitle>{title}</StepperTitle>
      <StepperList>
        {children}
      </StepperList>
    </StepperContext.Provider>
  )
}

export default Stepper
