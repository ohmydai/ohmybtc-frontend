import styled from 'styled-components'
import { media } from '../../theme'

const Brand = styled.div`
  display: flex;
  justify-content: flex-start;
  min-width: 100px;

  a {
    color: #3bf261;
    font-weight: 900;
  }

  img {
    height: 1.5em;
    vertical-align: middle;
  }
  
  ${media.md.down`
    width: 100%;
    margin-right: 0;
    justify-content: flex-start;
  `}
  
  ${media.sm.down`
    justify-content: center;
    margin-top: 15px;
    margin-bottom: 15px;
    min-width: 100%;
  `}
`

export default Brand
