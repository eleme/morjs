const EVENT_NAME = 'check:internal'
let pending = false

export async function isIntranet() {
  if (pending === false) {
    pending = true
    _checkIntranet().then((validAuthorization) => {
      if (validAuthorization) {
        window.dispatchEvent(new CustomEvent(EVENT_NAME))
        pending = false
      }
    })
  }

  return new Promise((resolve) => {
    const fullfilled = () => {
      window.removeEventListener(EVENT_NAME, fullfilled)
      resolve()
    }
    window.addEventListener(EVENT_NAME, fullfilled)
  })
}

// 检查是否是内网环境
async function _checkIntranet() {
  try {
    const checkResult = await fetch(
      'https://alilang-intranet.alibaba-inc.com/is_white_list.json',
      { headers: { 'need-json': '1' } }
    ).then((res) => res.json())
    return (
      checkResult &&
      checkResult.content === true &&
      checkResult.hasError === false
    )
  } catch (error) {
    return false
  }
}
