import { createBrowserHistory, createHashHistory, History } from 'history'

export let mode: string
export let history: History

export function setHistoryMode(historyMode: string, basename: string) {
  mode = historyMode
  const options = { basename }

  if (mode === 'hash') {
    history = createHashHistory(options)
  } else {
    history = createBrowserHistory(options)
  }
  window.__history = history
}
