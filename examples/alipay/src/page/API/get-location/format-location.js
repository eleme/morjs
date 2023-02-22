function formatLocation(longitude, latitude) {
  longitude = Number(longitude).toFixed(2)
  latitude = Number(latitude).toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

export default formatLocation
