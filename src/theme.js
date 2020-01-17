import { createGlobalStyle } from 'styled-components'
import createMediaQueries from './utils/media-query'

// Colors
export const color = {
  primary: '#3c4653',
  blue: '#39e6e0',
  purple: '#4420d8',
  purpleAux: '#917dff',
  yellow: '#ffbe44',
  pink: '#ff2972',
  white: '#fff',
  black: '#000',
  greenLight: '#7fed73',
  grey: '#ccc'
}

export const sizes = {
  xs: 576,
  sm: 768,
  md: 992,
  lg: 1280
}

export const media = createMediaQueries(sizes)

export const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: 'AvenirNext-Bold';
    src: local('AvenirNext-Bold'), url(fonts/AvenirNextLTPro-Bold.otf) format('truetype');
  }
  
  @font-face {
    font-family: 'AvenirNext-Regular';
    src: local('AvenirNext-Regular'), url(fonts/AvenirNextLTPro-Regular.otf) format('truetype');
  }
  
  html {
    font-size: 112.5%;
  }
  
  body {
    background: ${color.white};
    color: ${color.primary};
    font-family: "AvenirNext-Bold", sans-serif;
    font-feature-settings: 'kern', 'liga', 'clig', 'calt';
    font-kerning: normal;
    font-weight: normal;
    line-height: 1.45em;
    word-wrap: break-word;
  }

  h1, h2, h3, h4, h5, h6 {
    padding: 0;
    color: inherit;
    font-weight: bold;
    line-height: 1.1;
    margin: 0 0 1.45rem;
    text-rendering: optimizeLegibility;
  }
  
  h1 {
    font-size: 2em;
    font-weight: 300;
  }
  
  h2 {
    font-size: 1.62671rem;
  }
  
  h3 {
    font-size: 1.38316rem;
  }
  
  h4 {
    font-size: 1rem;
  }
  
  h5 {
    font-size: 0.85028rem;
  }
  
  h6 {
    font-size: 0.78405rem;
  }
  
  button {
    background: ${color.primary};
    border: 1px solid ${color.white};
    box-shadow: none;
    color: ${color.white};
    cursor: pointer;
    font-size: 16px;
    font-weight: 400;
    outline: none;
    padding: 10px 15px;
    transition: all 200ms;
  
    &:hover:not(:disabled) {
      background: ${color.white};
      color: ${color.primary};
      border-color: ${color.primary};
    }
    
    &:disabled {
      background-color: ${color.greenLight};
      border-radius: 25px;
      cursor: not-allowed;
      opacity: 0.3;
    }
  
    &.yellow {
      background: ${color.yellow};
      &:hover {
        background: ${color.white};
        color: ${color.yellow};
        border-color: ${color.yellow};
      }
    }
  
    &.pink {
      background: ${color.pink};
      &:hover {
        background: ${color.white};
        color: ${color.pink};
        border-color: ${color.pink};
      }
    }
  }
  
  a {
    text-decoration: none;
  }
  
  #root {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  ${media.xs.down`
    html {
      font-size: 100%;
    }
  `}
`
