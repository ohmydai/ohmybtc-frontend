import { css } from 'styled-components'

export default function createMediaQueries (breakpoints) {
  const media = {}

  const onlySizes = {
    xs: [null, breakpoints.sm - 1],
    sm: [breakpoints.sm, breakpoints.md - 1],
    md: [breakpoints.md, breakpoints.lg - 1],
    lg: [breakpoints.lg, null]
  }

  Object.keys(onlySizes).reduce((acc, size) => {
    const boundaries = onlySizes[size]
      .map((value, i) => {
        if (value) {
          return i === 0 ? `(min-width: ${value}px)` : `(max-width: ${value}px)`
        }

        return null
      })
      .filter(value => typeof value === 'string')
      .join(' and ')

    acc[size] = (...args) => css`
      @media ${boundaries} {
        ${css(...args)}
      }
    `

    addConditionalRule(acc[size])

    return acc
  }, media)

  Object.keys(breakpoints).reduce((acc, size) => {
    acc[size].up = (...args) => css`
      @media (min-width: ${breakpoints[size]}px) {
        ${css(...args)}
      }
    `

    acc[size].down = (...args) => css`
      @media (max-width: ${breakpoints[size]}px) {
        ${css(...args)}
      }
    `

    addConditionalRule(acc[size].up)
    addConditionalRule(acc[size].down)

    return acc
  }, media)

  return media
}

function addConditionalRule (mediaQuery) {
  mediaQuery.when = conditional => conditional ? mediaQuery : () => ''
}
