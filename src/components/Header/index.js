import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/ohmydai.png'
import { useDefaultAccount } from '../../hooks/web3'
import EthereumButton from 'ethereum-connect-button'
import ExternalLink from '../ExternalLink'
import styled from 'styled-components'
import { color, media } from '../../theme'
import Brand from './Brand'

const StyledHeader = styled.div`
  background: #121315;
  display: flex;
  justify-content: center;

  nav {
    width: 100%;
    max-width: 1180px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  ul {
    margin: 0;
    padding: 0;
    display: flex;
    flex-flow: row nowrap;
    height: 60px;
    list-style: none;

    li {
      padding: 15px;
      margin: 0 60px 0 0;
      text-decoration: none;
      
      a {
        color: ${color.white};
        font-size: 14px;
        text-decoration: none;
        font-family: "AvenirNext-Bold", sans-serif;
        font-weight: 600;
        letter-spacing: 0.8px;
        opacity: 0.8;

        &:hover {
          opacity: 1;
          text-decoration: none;
          border-bottom: 2px solid ${color.white};
        }
      }
      
      &:last-child {
        padding-top: 10px;
      }
    }
  }
  
  ${media.sm.down`
    nav {
      flex-flow: row wrap;
      margin-top: 10px;
      margin-bottom: 10px;
    }

    ul {
      flex-direction: row;
      height: auto;
      width: 100%;
      li {
        width: 100%;
        text-align: left;
        padding: 3px 0;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  `}
`

const Header = () => {
  const account = useDefaultAccount()

  return (
    <StyledHeader>
      <nav>
        <Brand>
          <Link to='/'>
            <img src={logo} alt='logo' />
          </Link>
        </Brand>
        <ul>
          <li>
            <Link to='/dashboard'>
              dashboard
            </Link>
          </li>
          <li>
            <ExternalLink href='https://medium.com/@ohmydai/introducing-ohmydai-1b9cafeecff8'>
              about
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href='https://medium.com/@ohmydai/faqs-4ad2b08d99b6'>
              FAQ
            </ExternalLink>
          </li>
          <li>
            <EthereumButton account={account} diameter={20} />
          </li>
        </ul>
      </nav>
    </StyledHeader>
  )
}

export default Header
