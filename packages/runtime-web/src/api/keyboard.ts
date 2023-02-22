export default {
  /**
   * 隐藏键盘
   */
  hideKeyboard() {
    ;(<any>document.activeElement).blur()
  }
}
