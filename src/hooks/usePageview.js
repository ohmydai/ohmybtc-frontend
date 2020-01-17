import { useEffect } from 'react'
import ReactGA from 'react-ga'

export default function usePageview () {
  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search)
  }, [])
}
