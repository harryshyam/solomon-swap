import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, useBalance } from 'wagmi';
import { ArrowDown, Settings, RefreshCw, ChevronDown, Info, Search, X } from 'lucide-react';
import { PolygonTokens, Token } from '../constants/tokens';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();

  // Selected Tokens
  const [sellToken, setSellToken] = useState<Token>(PolygonTokens[0]); // POL
  const [buyToken, setBuyToken] = useState<Token>(PolygonTokens[1]);   // USDC

  // Form State
  const [sellAmount, setSellAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState('0.5');

  // Modal Controls
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [selectingTarget, setSelectingTarget] = useState<'sell' | 'buy'>('sell');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  // Account Balance
  const { data: userBalance } = useBalance({
    address,
    token: sellToken.symbol === 'POL' ? undefined : (sellToken.address as `0x${string}`),
  });

  // Fetch Quote on Amount / Token Change
  useEffect(() => {
    if (!sellAmount || parseFloat(sellAmount) <= 0 || !address) {
      setQuote(null);
      return;
    }

    const timer = setTimeout(() => {
      handleFetchQuote();
    }, 400);

    return () => clearTimeout(timer);
  }, [sellAmount, sellToken, buyToken, slippage, address]);

  const handleFetchQuote = async () => {
    if (!sellAmount || !address) return;
    setLoading(true);

    try {
      const parsedAmount = (
        BigInt(Math.floor(parseFloat(sellAmount) * 10 ** sellToken.decimals))
      ).toString();

      const res = await fetch(
        `/api/swap?chainId=137&sellToken=${sellToken.address}&buyToken=${buyToken.address}&sellAmount=${parsedAmount}&taker=${address}&slippagePercentage=${parseFloat(slippage) / 100}`
      );
      const data = await res.json();
      setQuote(data);
    } catch (err) {
      console.error('Failed to fetch route:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    setSellAmount('');
    setQuote(null);
  };

  const openModalFor = (target: 'sell' | 'buy') => {
    setSelectingTarget(target);
    setIsTokenModalOpen(true);
  };

  const selectToken = (token: Token) => {
    if (selectingTarget === 'sell') {
      if (token.address === buyToken.address) handleSwapTokens();
      else setSellToken(token);
    } else {
      if (token.address === sellToken.address) handleSwapTokens();
      else setBuyToken(token);
    }
    setIsTokenModalOpen(false);
  };

  const handleExecuteSwap = () => {
    if (!quote || !quote.transaction) return;
    sendTransaction({
      to: quote.transaction.to,
      data: quote.transaction.data,
      value: BigInt(quote.transaction.value || 0),
    });
  };

  return (
    <main className="min-h-screen bg-[#0b0e14] text-white flex flex-col items-center select-none font-sans">
      {/* Header */}
      <header className="w-full max-w-7xl flex justify-between items-center px-6 py-4 border-b border-zinc-800/50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20">
              S
            </div>
            <span className="font-extrabold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
              SOLOMON
            </span>
          </div>

          <nav className="hidden md:flex gap-6 text-sm font-semibold text-zinc-400">
            <span className="text-amber-400 cursor-pointer">Swap</span>
            <span className="hover:text-white transition cursor-pointer">Tokens</span>
            <span className="hover:text-white transition cursor-pointer">Pools</span>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800/80 rounded-xl text-amber-400 font-bold text-xs hover:border-amber-500/40 transition"
          >
            {currency === 'INR' ? '₹ INR' : '$ USD'}
          </button>
          <ConnectButton chainStatus="icon" showBalance={false} />
        </div>
      </header>

      {/* Main Swap Box */}
      <div className="mt-12 w-full max-w-md px-4">
        <div className="bg-[#12161f] border border-zinc-800/90 rounded-3xl p-4 shadow-2xl relative">
          
          {/* Card Header & Controls */}
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="text-base font-bold text-zinc-200">Swap</span>
            <div className="flex items-center gap-3 text-zinc-400">
              <RefreshCw
                onClick={handleFetchQuote}
                className={`w-4 h-4 hover:text-amber-400 cursor-pointer transition ${loading ? 'animate-spin text-amber-400' : ''}`}
              />
              <Settings
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="w-4 h-4 hover:text-amber-400 cursor-pointer transition"
              />
            </div>
          </div>

          {/* Settings Drawer */}
          {isSettingsOpen && (
            <div className="mb-4 p-3 bg-[#181d29] border border-zinc-800 rounded-2xl">
              <div className="text-xs font-semibold text-zinc-400 mb-2">Slippage Tolerance</div>
              <div className="flex gap-2">
                {['0.1', '0.5', '1.0'].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSlippage(val)}
                    className={`flex-1 py-1 rounded-xl text-xs font-bold transition ${
                      slippage === val ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* You Pay Section */}
          <div className="bg-[#181d29] border border-zinc-800/70 rounded-2xl p-4 hover:border-zinc-700 transition">
            <div className="flex justify-between text-xs font-semibold text-zinc-400">
              <span>You pay</span>
              {userBalance && (
                <span>
                  Balance: {parseFloat(userBalance.formatted).toFixed(3)} {sellToken.symbol}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center mt-3 gap-2">
              <input
                type="number"
                placeholder="0"
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
                className="bg-transparent text-3xl font-extrabold text-white outline-none w-full placeholder:text-zinc-600"
              />
              <button
                onClick={() => openModalFor('sell')}
                className="flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 px-3 py-1.5 rounded-2xl font-bold text-white transition text-sm shrink-0"
              >
                <img src={sellToken.logoURI} alt={sellToken.symbol} className="w-5 h-5 rounded-full" />
                <span>{sellToken.symbol}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="text-xs text-zinc-500 mt-2 font-medium">
              ≈ {currency === 'INR' ? `₹${(parseFloat(sellAmount || '0') * 32.5).toFixed(2)}` : `$${(parseFloat(sellAmount || '0') * 0.38).toFixed(2)}`}
            </div>
          </div>

          {/* Swap Direction Toggle Switch */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleSwapTokens}
              className="bg-[#12161f] border border-zinc-800 p-2.5 rounded-2xl text-zinc-400 hover:text-amber-400 hover:border-amber-500/40 transition shadow-md"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* You Receive Section */}
          <div className="bg-[#181d29] border border-zinc-800/70 rounded-2xl p-4 hover:border-zinc-700 transition">
            <div className="flex justify-between text-xs font-semibold text-zinc-400">
              <span>You receive</span>
            </div>
            <div className="flex justify-between items-center mt-3 gap-2">
              <input
                type="text"
                readOnly
                placeholder="0"
                value={
                  quote?.buyAmount
                    ? (parseFloat(quote.buyAmount) / 10 ** buyToken.decimals).toFixed(4)
                    : ''
                }
                className="bg-transparent text-3xl font-extrabold text-amber-400 outline-none w-full placeholder:text-zinc-600"
              />
              <button
                onClick={() => openModalFor('buy')}
                className="flex items-center gap-2 bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700/60 px-3 py-1.5 rounded-2xl font-bold text-white transition text-sm shrink-0"
              >
                <img src={buyToken.logoURI} alt={buyToken.symbol} className="w-5 h-5 rounded-full" />
                <span>{buyToken.symbol}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Route Details Breakdown */}
          {quote && (
            <div className="mt-3 p-3 bg-zinc-900/40 rounded-2xl border border-zinc-800/60 text-xs space-y-1.5 text-zinc-400">
              <div className="flex justify-between">
                <span>Exchange Rate</span>
                <span className="font-semibold text-zinc-200">
                  1 {sellToken.symbol} ≈ {(parseFloat(quote.buyAmount) / 10 ** buyToken.decimals / (parseFloat(sellAmount) || 1)).toFixed(4)} {buyToken.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span className="text-zinc-300">~ $0.002 (Polygon)</span>
              </div>
              <div className="flex justify-between">
                <span>Solomon Fee</span>
                <span className="text-amber-400 font-semibold">0.25% Included</span>
              </div>
            </div>
          )}

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
            ) : !sellAmount || parseFloat(sellAmount) <= 0 ? (
              <button
                disabled
                className="w-full py-4 bg-zinc-800 text-zinc-500 font-extrabold rounded-2xl cursor-not-allowed"
              >
                Enter an amount
              </button>
            ) : loading ? (
              <button
                disabled
                className="w-full py-4 bg-amber-500/40 text-black font-black rounded-2xl cursor-wait"
              >
                Fetching Best Route...
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

      {/* Token Selector Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12161f] border border-zinc-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-lg text-white">Select a token</span>
              <X
                onClick={() => setIsTokenModalOpen(false)}
                className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {PolygonTokens.map((token) => (
                <div
                  key={token.address}
                  onClick={() => selectToken(token)}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-800/80 cursor-pointer transition"
                >
                  <img src={token.logoURI} alt={token.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="font-bold text-white">{token.symbol}</div>
                    <div className="text-xs text-zinc-400">{token.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}