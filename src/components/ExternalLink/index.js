import React from 'react'

const ExternalLink = ({ children, ...props }) => (
  <a {...props} target='_blank' rel='noopener noreferrer'>
    {children}
  </a>
)

export default ExternalLink
