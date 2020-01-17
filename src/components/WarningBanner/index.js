import React from 'react'
import useLocalStorage from '../../hooks/localstorage'
import styled from 'styled-components'
import BannerIcon from './BannerIcon'
import BannerClose from './BannerClose'

const Banner = styled.div`
  background-color: #467042;
  color: #1e1f23;
  border-radius: 36px;
  font-family: monospace;
  padding: 4px 10px 2px 20px;
  position: relative;
  margin-top: 30px;
  max-width: 510px;
  text-align: left;
  width: 100%;

  p {
      display: inline-block;
      margin: 0;
  }
`

const WarningBanner = () => {
  const [showBanner, setShowBanner] = useLocalStorage('show_warning', true)
  if (!showBanner) return null

  return (
    <Banner>
      <BannerClose onClick={() => setShowBanner(false)}>&times;</BannerClose>
      <p>
        <BannerIcon><span role='img' aria-label='warning'>💀</span></BannerIcon>
        This project is in beta. Use at your own risk.
      </p>
    </Banner>
  )
}

export default WarningBanner
