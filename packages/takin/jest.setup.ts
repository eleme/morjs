jest.mock('./src/utils/requireResolve', () => {
  return {
    requireResolve: jest.fn((id: string) => id)
  }
})
