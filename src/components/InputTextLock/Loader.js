import styled from 'styled-components'
import loaderIcon from '../../assets/loading.gif'

const Loader = styled.img.attrs({
  src: loaderIcon,
  alt: 'loading-gif'
})`
  width: 64px;
`

export default Loader
