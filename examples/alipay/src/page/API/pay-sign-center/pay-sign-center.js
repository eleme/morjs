Page({
  paySignCenter() {
    my.paySignCenter({
      signStr:
        'biz_content%3d%257B%2522access_params%2522%253A%257B%2522channel%2522%253A%2522ALIPAYAPP%2522%257D%252C%2522external_agreement_no%2522%253A%2522yufa11111%2522%252C%2522personal_product_code%2522%253A%2522GENERAL_WITHHOLDING_P%2522%252C%2522product_code%2522%253A%2522GENERAL_WITHHOLDING%2522%252C%2522sign_scene%2522%253A%2522INDUSTRY%257CCARRENTAL%2522%252C%2522third_party_type%2522%253A%2522PARTNER%2522%257D%26sign%3dJ9ysCCt7MaYcL1d%252Bt89jTxYyT4FNVt5gdRzNJ5P4WUfV2xM%252FZ2vg14sAC%252FXLyaA4PIw%252B2yCA5zA1UQtqwOuO7Q7Dlzeyg0yZTVrjw55CalNBnhFKcyEHXDXHmO%252F2kWO9mWlI8VFdgtYmK6FX%252FOB%252F2vmoM9DYqWsRkqiT6%252Bnd90o%253D%26timestamp%3d2017-09-22%2b14%253A45%253A04%26sign_type%3dRSA%26charset%3dUTF-8%26app_id%3d2017060807451366%26method%3dalipay.user.agreement.page.sign%26version%3d1.0',
      success: (res) => {
        my.alert({
          title: 'success', // alert 框的标题
          content: JSON.stringify(res)
        })
      },
      fail: (res) => {
        my.alert({
          title: 'fail', // alert 框的标题
          content: JSON.stringify(res)
        })
      }
    })
  }
})
