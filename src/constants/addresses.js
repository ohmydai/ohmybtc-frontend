const getAddressObject = networkVersion => {
  if (networkVersion === '42') {
    return {
      daiAddress: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      usdcAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      optionAddress: '0x8860b076BDD6640F2FE5C9157e5B5C87561b268f'
    }
  }
  if (networkVersion === '4') {
    return {
      daiAddress: '0x656debb4afabb8577085b5e52f8a3d71de036fbd',
      usdcAddress: '0xb48af4cd6694075d2f536d76e7ad1bf6574e4cf1',
      optionAddress: '0x64a03cE1E52B4e579f0A1cf44cF95C0D7898B5A3',
      factoryAddress: '0xf5D915570BC477f9B8D6C0E980aA81757A3AaC36'
    }
  } else {
    return {
      daiAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
      usdcAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      optionAddress: '0x64a03cE1E52B4e579f0A1cf44cF95C0D7898B5A3',
      factoryAddress: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
    }
  }
}

export default getAddressObject
