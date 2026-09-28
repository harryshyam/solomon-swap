import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useSendTransaction } from 'wagmi'
import { ArrowDown, Settings, RefreshCw } from 'lucide-react'

export default function Home() {
  const { address, isConnected } = useAccount()
  const { sendTransaction } = useSendTransaction()

  const [currency, setCurrency] = useState('INR')
  const [sellAmount, setSellAmount] = useState('')
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFetchQuote = async () => {
    if (!sellAmount || !address) return
    setLoading(true)

    try {
      const parsedAmount = (parseFloat(sellAmount) * 1e18).toString()
      const res = await fetch(
        `/api/swap?chainId=137&sellToken=0x0000000000000000000000000000000000001010&buyToken=0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359&sellAmount=${parsedAmount}&taker=${address}`
      )
      const data = await res.json()
      setQuote(data)
    } catch (err) {
      console.error('Failed to fetch quote', err)
    } finally {
      setLoading(false)
    }
  }

  const handleExecuteSwap = () => {
    if (!quote || !quote.transaction) return
    sendTransaction({
      to: quote.transaction.to,
      data: quote.transaction.data,
      value: BigInt(quote.transaction.value || 0),
    })
  }

  return (
    <main className="min-h-screen bg-[#0d0e12] text-white flex flex-col items-center">
      {/* Header Bar */}
      <header className="w-full max-w-7xl flex justify-between items-center px-6 py-4 border-b border-zinc-800/60">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/10">
              S
            </div>
            <span className="font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              SOLOMON
            </span>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
            <span className="text-white font-semibold cursor-pointer">Swap</span>
            <span className="hover:text-white transition cursor-pointer">Tokens</span>
            <span className="hover:text-white transition cursor-pointer">Pools</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-amber-400 font-semibold text-xs hover:border-amber-500/50 transition"
          >
            Display: {currency} ({currency === 'INR' ? '₹' : '$'})
          </button>
          <ConnectButton />
        </div>
      </header>

      {/* Main Swap Card Area */}
      <div className="mt-16 w-full max-w-md px-4">
        <div className="bg-[#131419] border border-zinc-800/80 rounded-3xl p-4 shadow-2xl">
          
          {/* Card Header */}
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-base font-semibold text-zinc-200">Swap</span>
            <div className="flex items-center gap-2 text-zinc-400">
              <RefreshCw className="w-4 h-4 hover:text-amber-400 cursor-pointer transition" />
              <Settings className="w-4 h-4 hover:text-amber-400 cursor-pointer transition" />
            </div>
          </div>

          {/* You Pay Section */}
          <div className="bg-[#1b1c22] border border-zinc-800/60 rounded-2xl p-4 hover:border-zinc-700 transition">
            <span className="text-xs font-medium text-zinc-400">You pay</span>
            <div className="flex justify-between items-center mt-2">
              <input
                type="number"
                placeholder="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="bg-transparent text-3xl font-semibold text-white outline-none w-full placeholder:text-zinc-600"
              />
              <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 px-3 py-1.5 rounded-full font-bold text-amber-400 transition text-sm">
                POL
              </button>
            </div>
            <div className="text-xs text-zinc-500 mt-2">
              ≈ {currency === 'INR' ? `₹${(parseFloat(sellAmount || '0') * 32.5).toFixed(2)}` : `$${(parseFloat(sellAmount || '0') * 0.38).toFixed(2)}`}
            </div>
          </div>

          {/* Swap Arrow Divider */}
          <div className="flex justify-center -my-3 relative z-10">
            <div className="bg-[#131419] border border-zinc-800 p-2 rounded-xl text-zinc-400 hover:text-amber-400 transition cursor-pointer">
              <ArrowDown className="w-4 h-4" />
            </div>
          </div>

          {/* You Receive Section */}
          <div className="bg-[#1b1c22] border border-zinc-800/60 rounded-2xl p-4 hover:border-zinc-700 transition">
            <span className="text-xs font-medium text-zinc-400">You receive</span>
            <div className="flex justify-between items-center mt-2">
              <input
                type="text"
                readOnly
                placeholder="0"
                value={quote ? (parseFloat(quote.buyAmount) / 1e6).toFixed(2) : ''}
                className="bg-transparent text-3xl font-semibold text-amber-300 outline-none w-full placeholder:text-zinc-600"
              />
              <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50 px-3 py-1.5 rounded-full font-bold text-amber-400 transition text-sm">
                USDC
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            {!isConnected ? (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    onClick={openConnectModal}
                    className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold rounded-2xl transition"
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            ) : !quote ? (
              <button
                onClick={handleFetchQuote}
                disabled={loading || !sellAmount}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl transition disabled:opacity-40"
              >
                {loading ? 'Fetching Best Route...' : 'Get Best Quote'}
              </button>
            ) : (
              <button
                onClick={handleExecuteSwap}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-black font-black rounded-2xl transition shadow-lg shadow-amber-500/10"
              >
                Confirm & Swap
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}