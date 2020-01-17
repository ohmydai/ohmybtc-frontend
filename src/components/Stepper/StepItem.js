import React, { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faCircle, faCircleNotch, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import styled from 'styled-components'
import { StepperContext } from './Stepper'
import { color } from '../../theme'

const Step = styled.li`
  opacity: 0.5;
  margin: 10px 0;
  
  &.completed {
    color: ${color.greenLight};
    opacity: 1;
  }

  &.failed {
    color: ${color.pink};
    opacity: 1;
  }

  &.current {
    font-size: 14px;
    opacity: 1;
  }
`

const StepperIcon = styled(FontAwesomeIcon)`
  margin-right: 20px;
`

const icons = {
  failed: faTimesCircle,
  current: faCircleNotch,
  completed: faCheckCircle,
  idle: faCircle
}

export default function StepItem ({ step, children }) {
  const { currentStep, failed } = useContext(StepperContext)
  const currentState = getCurrentState(currentStep, step, failed)
  const icon = icons[currentState]

  return (
    <Step className={currentState}>
      <StepperIcon
        icon={icon}
        spin={icon === faCircleNotch}
      />{children}
    </Step>
  )
}

function getCurrentState (currentStep, step, failed) {
  if (failed === step) {
    return 'failed'
  } else if (currentStep === step) {
    return 'current'
  } else if (currentStep >= step) {
    return 'completed'
  } else {
    return 'idle'
  }
}
