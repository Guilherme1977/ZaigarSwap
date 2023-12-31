import { useCallback, useEffect, useState } from 'react'

const getNow = () => Math.floor(Date.now() / 1000)

/**
 * Consider this moving up to the global level
 */
const useCountdown = (timestamp: number) => {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    return timestamp - getNow()
  })
  const [isPaused, setIsPaused] = useState(false)

  const pause = useCallback(() => setIsPaused(true), [setIsPaused])
  const unpause = useCallback(() => setIsPaused(false), [setIsPaused])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (!isPaused && secondsRemaining > 0) {
      timer = setTimeout(() => {
        setSecondsRemaining((prevSecondsRemaining) => prevSecondsRemaining - 1)
      }, 1000)
    }

    return () => {
      clearTimeout(timer)
    }
  }, [secondsRemaining, isPaused, setSecondsRemaining])

  useEffect(() => {
    setSecondsRemaining(timestamp - getNow())
  }, [timestamp, setSecondsRemaining])

  // Pause the timer if the tab becomes inactive to avoid it becoming out of sync
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState) {
        setSecondsRemaining(timestamp - getNow())
        unpause()
      } else {
        pause()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [pause, unpause, timestamp, setSecondsRemaining])

  return { secondsRemaining, pause, unpause }
}

export default useCountdown
