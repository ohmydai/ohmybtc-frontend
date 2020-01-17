import React from 'react'
import { Route } from 'react-router-dom'
import usePageview from '../../hooks/usePageview'

export default function Page ({ children, path, exact = false }) {
  usePageview()

  return (
    <Route path={path} exact={exact}>
      <main>
        {children}
      </main>
    </Route>
  )
}
