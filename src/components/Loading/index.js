import React from 'react'
import LoadingGif from '../../assets/loading.gif'
import styled from 'styled-components'

const Image = styled.img`
  margin: auto;
  max-width: 60px;
  max-height: 60px;
`

const Loading = () => {
  return <Image src={LoadingGif} alt='loading-icon' />
}

export default Loading
