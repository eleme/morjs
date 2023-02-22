export default {
  makePhoneCall(params: PhoneOptions) {
    try {
      const { number } = params

      if (!number) return

      location.href = 'tel:' + number
    } catch (e) {}
  }
}
