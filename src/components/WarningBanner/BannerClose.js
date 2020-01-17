import styled from 'styled-components'
import { media } from '../../theme'

const BannerClose = styled.span`
  cursor: pointer;
  font-size: 22px;
  float: right;
  
  ${media.sm.down`
    float: none;
    position: absolute;
    right: 10px;
    top: 15px;
  `}
`

export default BannerClose
