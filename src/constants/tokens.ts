export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
}

export const PolygonTokens: Token[] = [
  {
    symbol: 'POL',
    name: 'Polygon Ecosystem Token',
    address: '0x0000000000000000000000000000000000001010',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174/logo.png',
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0xc2132D05D31c914a87C6611C10748AEb04B58e8F/logo.png',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    decimals: 18,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619/logo.png',
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped BTC',
    address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
    decimals: 8,
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/assets/0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6/logo.png',
  },
];