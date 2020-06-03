import { useState, useCallback, useEffect, useRef } from "react"
import { useWeb3React as useWeb3ReactCore } from "@web3-react/core"
import copy from "copy-to-clipboard"

import { isAddress } from "../utils"
import { injected } from "../connectors"

const Box = require("3box")

export function useWeb3React() {
  const context = useWeb3ReactCore()
  const contextNetwork = useWeb3ReactCore("NETWORK")

  return context.active ? context : contextNetwork
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore()

  const [tried, setTried] = useState(false)

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        setTried(true)
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleNetworkChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(() => {})
      }

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(() => {})
        }
      }

      ethereum.on("networkChanged", handleNetworkChanged)
      ethereum.on("accountsChanged", handleAccountsChanged)

      return () => {
        ethereum.removeListener("networkChanged", handleNetworkChanged)
        ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }

    return () => {}
  }, [active, error, suppress, activate])
}

// modified from https://usehooks.com/useDebounce/
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Update debounced value after delay
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (also on delay change or unmount)
    // This is how we prevent debounced value from updating if value is changed ...
    // .. within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// modified from https://usehooks.com/useKeyPress/
export function useBodyKeyDown(
  targetKey,
  onKeyDown,
  suppressOnKeyDown = false
) {
  const downHandler = useCallback(
    (event) => {
      const {
        target: { tagName },
        key,
      } = event
      if (key === targetKey && tagName === "BODY" && !suppressOnKeyDown) {
        event.preventDefault()
        onKeyDown()
      }
    },
    [targetKey, onKeyDown, suppressOnKeyDown]
  )

  useEffect(() => {
    window.addEventListener("keydown", downHandler)
    return () => {
      window.removeEventListener("keydown", downHandler)
    }
  }, [downHandler])
}

export function useENSName(address) {
  const { library } = useWeb3React()

  const [ENSName, setENSName] = useState()

  useEffect(() => {
    if (isAddress(address)) {
      let stale = false
      try {
        library.lookupAddress(address).then((name) => {
          if (!stale) {
            if (name) {
              setENSName(name)
            } else {
              setENSName(null)
            }
          }
        })
      } catch {
        setENSName(null)
      }

      return () => {
        stale = true
        setENSName()
      }
    }
  }, [library, address])

  return ENSName
}

export function useCopyClipboard(timeout = 500) {
  const [isCopied, setIsCopied] = useState(false)

  const staticCopy = useCallback((text) => {
    const didCopy = copy(text)
    setIsCopied(didCopy)
  }, [])

  useEffect(() => {
    if (isCopied) {
      const hide = setTimeout(() => {
        setIsCopied(false)
      }, timeout)

      return () => {
        clearTimeout(hide)
      }
    }
  }, [isCopied, setIsCopied, timeout])

  return [isCopied, staticCopy]
}

// modified from https://usehooks.com/usePrevious/
export function usePrevious(value) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef()

  // Store current value in ref
  useEffect(() => {
    ref.current = value
  }, [value]) // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current
}

export function useBoxStorage(address, provider) {
  const [userSpace, setUserSpace] = useState()

  useEffect(() => {
    async function setBoxSpace() {
      const box = await Box.openBox(address, provider)
      const space = await box.openSpace("quests")
      if (space) {
        setUserSpace(space)
      }
    }
    setBoxSpace()
  }, [address, provider])

  return userSpace
}

export function useNotificationThread(space, account) {
  const [notificationThread, setNotificationThread] = useState()

  useEffect(() => {
    if (space) {
      async function _setNotificationThread() {
        const notificationThread = await space.createConfidentialThread(
          account.toLowerCase() + "notificationThread",
          {
            members: true,
          }
        )
        if (notificationThread) {
          setNotificationThread(notificationThread)
        }
      }
      _setNotificationThread()
    }
  }, [space, account])

  return notificationThread
}

export function useThreadPosts(thread) {
  const [threadPosts, setThreadPosts] = useState()

  useEffect(() => {
    if (thread) {
      async function _setThreadPosts() {
        const posts = await thread.getPosts()
        setThreadPosts(posts)
      }
      _setThreadPosts()
    }
  }, [thread])

  return threadPosts
}

export function useQuestThreads(space, quests) {
  const [questThreads, setQuestThreads] = useState()

  useEffect(() => {
    let questThreads = []
    Promise.all(
      Object.keys(quests).map((quest) => {
        async function getQuestThread() {
          const thread = await space.joinThread(quest.id, {
            firstModerator: "some3ID",
            members: true,
          })
          questThreads.push(thread)
        }
        getQuestThread()
        return true
      })
    )
    setQuestThreads(questThreads)
  }, [space, quests])

  return questThreads
}
