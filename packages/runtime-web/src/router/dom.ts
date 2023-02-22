export function initLayout(rootElement: HTMLElement) {
  // 自定义了根节点
  if (rootElement) return

  createTabBarDom()
  loadGlobalStyle()
}

function createTabBarDom() {
  const container = document.createElement('div')
  container.classList.add('tiga-tabbar__container')
  container.id = 'container'

  const panel = document.createElement('div')
  panel.classList.add('tiga-tabbar__panel')

  const app = document.createElement('div')
  app.id = 'app'
  app.classList.add('tiga_router')

  panel.appendChild(app)
  container.appendChild(panel)

  document.body.appendChild(container)
}

function loadGlobalStyle() {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = `html, body {
    height: 100%;
  }
  #app {
    height: 100%;
  }
  tiga-page {
    min-height: 100%;
  }
  .tiga-tabbar__container {
    display: flex;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
  }
  .tiga-tabbar__panel {
    flex: 1;
    position: relative;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .tiga-page-wrap {
      height: 100%;
  }`
  document.getElementsByTagName('head')[0].appendChild(style)
}
