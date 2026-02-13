import React, { useState } from 'react';
import { itemsData } from '../data/items.ts';
import { GameState, Inventory } from '../types.ts';

interface ProcurementModalProps {
  onClose: () => void;
  state: GameState;
  onAction: (type: string, payload?: Record<string, unknown>) => void;
}

const ProcurementModal: React.FC<ProcurementModalProps> = ({ onClose, state, onAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'black_market'>('catalog');

  const { resources } = state;

  const showBlackMarket = state.procurement.catalogueUnlockLevel >= 2;

  // Filter items based on availability and search
  const availableItems = itemsData.shop.filter((item) => {
    const isOwned = state.inventory[item.id as keyof Inventory];
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && !isOwned;
  });

  const blackMarketItems =
    itemsData.blackMarket?.filter((item) => {
      const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  const activeOrders = state.procurement.orders.filter(
    (o) => o.status === 'ORDERED' || o.status === 'SHIPPED'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-zinc-900 border-2 border-emerald-900/50 flex flex-col shadow-[0_0_50px_rgba(16,185,129,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-900/30 bg-black/40">
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 font-bold text-lg font-mono">[SUPPLY]</span>
            <div>
              <h2 className="text-xl font-bold text-emerald-400 uppercase tracking-widest">
                Procurement Catalog
              </h2>
              <p className="text-xs text-emerald-700 font-mono">SUPPLY_CHAIN_MANAGEMENT_V2.1</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-emerald-900/20 text-emerald-600 hover:text-emerald-400 transition-colors font-mono font-bold"
          >
            [CLOSE]
          </button>
        </div>

        {/* Tabs & Search */}
        <div className="flex items-center justify-between p-4 bg-emerald-950/10 border-b border-emerald-900/20">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                activeTab === 'catalog'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-black/20 border-zinc-700 text-zinc-500 hover:border-zinc-500'
              }`}
            >
              Catalog
            </button>
            {showBlackMarket && (
              <button
                onClick={() => setActiveTab('black_market')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                  activeTab === 'black_market'
                    ? 'bg-red-900/40 border-red-600 text-red-500'
                    : 'bg-black/20 border-zinc-700 text-zinc-600 hover:border-red-900/50 hover:text-red-800'
                }`}
              >
                [RESTRICTED]
              </button>
            )}
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                  : 'bg-black/20 border-zinc-700 text-zinc-500 hover:border-zinc-500'
              }`}
            >
              Active Orders
              {activeOrders.length > 0 && (
                <span className="bg-emerald-500 text-black text-[9px] px-1.5 py-0.5 rounded-full">
                  {activeOrders.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <span className="text-emerald-700 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs">
              {'>'}
            </span>
            <input
              type="text"
              placeholder="SEARCH CATALOG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-black/40 border border-emerald-900/30 text-emerald-300 text-xs w-64 focus:outline-none focus:border-emerald-500/50 placeholder-emerald-800"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-[url('/grid_pattern.png')] bg-repeat opacity-90">
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group bg-black/40 border border-emerald-900/30 p-4 hover:border-emerald-500/50 transition-all hover:bg-emerald-900/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-mono">P/N: {item.pn}</span>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="text-xs text-zinc-500">
                      Cost:{' '}
                      <span
                        className={
                          resources.credits >= item.cost ? 'text-amber-400' : 'text-red-500'
                        }
                      >
                        {item.cost} CR
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onAction('PLACE_ORDER', {
                          itemId: item.id,
                          itemLabel: item.label,
                          cost: item.cost,
                          etaSeconds: 60 + Math.random() * 120, // Random lead time 1-3 mins
                        })
                      }
                      disabled={resources.credits < item.cost}
                      className="px-3 py-1.5 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-[10px] font-bold uppercase hover:bg-emerald-700/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      [PLACE ORDER]
                    </button>
                  </div>
                </div>
              ))}

              {availableItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-emerald-800 italic">
                  No items found matching criteria.
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              {state.procurement.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-black/20 border border-emerald-900/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-900/10 rounded-full border border-emerald-900/30 font-mono text-xs text-emerald-500">
                      {order.status === 'DELIVERED' ? '[ARR]' : '[TRN]'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-300">{order.itemLabel}</h4>
                      <p className="text-[10px] text-zinc-500 font-mono">ID: {order.id}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-500 mb-1">
                      {order.status === 'DELIVERED' ? 'ARRIVED' : 'IN TRANSIT'}
                    </div>
                    {order.status === 'ORDERED' && <EtaDisplay eta={order.deliveryEta} />}

                    {order.status === 'ORDERED' && (
                      <button
                        onClick={() => onAction('CANCEL_ORDER', { orderId: order.id })}
                        className="mt-2 text-[9px] text-red-500 hover:text-red-400 underline"
                      >
                        [CANCEL]
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {state.procurement.orders.length === 0 && (
                <div className="text-center py-12 text-emerald-800 italic">
                  No active orders. Check the catalog to procure items.
                </div>
              )}
            </div>
          )}

          {activeTab === 'black_market' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blackMarketItems.map((item) => (
                <div
                  key={item.id}
                  className="relative group bg-red-950/20 border border-red-900/30 p-4 hover:border-red-500/50 transition-all hover:bg-red-900/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase">{item.label}</span>
                    <span className="text-[10px] text-red-800 font-mono">P/N: {item.pn}</span>
                  </div>

                  <p className="text-[10px] text-red-900/80 mb-4 h-8 overflow-hidden">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-end mt-4">
                    <div className="text-xs text-zinc-500">
                      Cost:{' '}
                      <span
                        className={
                          resources.credits >= item.cost ? 'text-amber-400' : 'text-red-500'
                        }
                      >
                        {item.cost} CR
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        onAction('PLACE_ORDER', {
                          itemId: item.id,
                          itemLabel: item.label,
                          cost: item.cost,
                          etaSeconds: 120 + Math.random() * 180,
                          isBlackMarket: true,
                        })
                      }
                      disabled={resources.credits < item.cost}
                      className="px-3 py-1.5 bg-red-900/30 border border-red-700/50 text-red-300 text-[10px] font-bold uppercase hover:bg-red-700/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      [ACQUIRE]
                    </button>
                  </div>
                </div>
              ))}

              {blackMarketItems.length === 0 && (
                <div className="col-span-full text-center py-12 text-red-900 italic">
                  The channels are quiet. No items available.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-900/30 bg-black/60 flex justify-between items-center text-xs text-zinc-600">
          <span>BUDGET: {resources.credits.toFixed(2)} CR</span>
          <span>AUTHORIZED PERSONNEL ONLY</span>
        </div>
      </div>
    </div>
  );
};

const EtaDisplay: React.FC<{ eta: number }> = ({ eta }) => {
  const [timeLeft, setTimeLeft] = React.useState(() =>
    Math.max(0, Math.ceil((eta - Date.now()) / 1000))
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, Math.ceil((eta - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [eta]);

  return <div className="text-[10px] text-amber-400 font-mono">ETA: {timeLeft}s</div>;
};

export default ProcurementModal;
