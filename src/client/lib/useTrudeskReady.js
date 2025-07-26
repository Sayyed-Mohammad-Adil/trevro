import { useEffect } from 'react'
import $ from 'jquery'

export default function useTrevyroReady (callback) {
  useEffect(() => {
    $(window).on('trevyro:ready', () => {
      if (typeof callback === 'function') return callback()
    })
  }, [])
}
