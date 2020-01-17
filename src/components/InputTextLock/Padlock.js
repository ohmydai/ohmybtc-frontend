import styled from 'styled-components'
import padlockIcon from './icons/padlock.svg'

const Padlock = styled.img.attrs(() => ({
  src: padlockIcon,
  alt: 'padlock-icon'
}))`
  margin: 20px auto;
  width: 30px;
  height: 30px;
  cursor: pointer;
  z-index: 1000;
`

export default Padlock
