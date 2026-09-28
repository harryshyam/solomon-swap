import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const chainId = searchParams.get('chainId') || '137' // Polygon default
  const sellToken = searchParams.get('sellToken')
  const buyToken = searchParams.get('buyToken')
  const sellAmount = searchParams.get('sellAmount')
  const taker = searchParams.get('taker')

  // Set your personal payout address and 0.25% fee
  const feeRecipient = '0xYourPersonalWalletAddressHere'
  const buyTokenPercentageFee = '0.0025' // 0.25% fee

  const url = `https://api.0x.org/swap/allowance-holder/quote?chainId=${chainId}&sellToken=${sellToken}&buyToken=${buyToken}&sellAmount=${sellAmount}&taker=${taker}&feeRecipient=${feeRecipient}&buyTokenPercentageFee=${buyTokenPercentageFee}`

  try {
    const res = await fetch(url, {
      headers: {
        '0x-api-key': process.env.ZEROX_API_KEY!,
        '0x-version': 'v2',
      },
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}