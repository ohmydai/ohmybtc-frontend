import React from 'react'
import styled from 'styled-components'
import mail from './icons/mail.svg'
import twitter from './icons/twitter.svg'
import github from './icons/github.svg'
import medium from './icons/medium.svg'
import telegram from './icons/telegram.svg'
import icon from './icons/icon.png'
import ExternalLink from '../ExternalLink'
import Logo from './Logo'
import SocialLinks from './SocialLInks'

const FooterContainer = styled.footer`
  background-color: black;
  display: flex;
  justify-content: space-between;
  padding: 14px 50px;
`

const Footer = () => (
  <FooterContainer>
    <Logo to='/'>
      <img src={icon} alt='ohmydai-icon' />
    </Logo>
    <SocialLinks>
      <ExternalLink href='mailto:ohmydai.io@gmail.com'>
        <img src={mail} alt='email' />
      </ExternalLink>
      <ExternalLink href='https://t.me/joinchat/DSUxh1QcM-e7SRQFzZywxQ'>
        <img src={telegram} alt='telegram' />
      </ExternalLink>
      <ExternalLink href='https://medium.com/ohmydai'>
        <img src={medium} alt='medium' />
      </ExternalLink>
      <ExternalLink href='https://twitter.com/ohmydai_io'>
        <img src={twitter} alt='twitter' />
      </ExternalLink>
      <ExternalLink href='https://github.com/ohmydai/contracts'>
        <img src={github} alt='github' />
      </ExternalLink>
    </SocialLinks>
  </FooterContainer>
)

export default Footer
