import React, { useMemo, useState } from 'react';
import { Search, MapPin, Star } from 'lucide-react';

const seedGyms = [
  { id: 'g1', name: 'Pulse Arena Gym', location: 'Downtown', rating: 4.7, price: 29, category: 'Gym' },
  { id: 'g2', name: 'Iron Forge Fitness', location: 'Uptown', rating: 4.5, price: 25, category: 'Gym' },
  { id: 'g3', name: 'ZenFit Studio', location: 'Midtown', rating: 4.8, price: 35, category: 'Sports Center' },
];

const seedTrainers = [
  { id: 't1', name: 'Alex Strong', expertise: 'Strength & Conditioning', rating: 4.9, price: 40 },
  { id: 't2', name: 'Mia Flex', expertise: 'Mobility & Yoga', rating: 4.6, price: 30 },
];

const seedBrands = [
  { id: 'b1', name: 'ProteinX', product: 'Whey Isolate 1kg', price: 49, url: 'https://example.com/proteinx' },
  { id: 'b2', name: 'FitWear', product: 'Breathable Tee', price: 19, url: 'https://example.com/fitwear' },
];

export default function Marketplace({ onSubscribe, onBookTrainer }) {
  const [q, setQ] = useState('');
  const [loc, setLoc] = useState('');
  const [tab, setTab] = useState('Gyms');

  const filteredGyms = useMemo(() =>
    seedGyms.filter((g) =>
      g.name.toLowerCase().includes(q.toLowerCase()) &&
      g.location.toLowerCase().includes(loc.toLowerCase())
    ), [q, loc]
  );

  const filteredTrainers = useMemo(() =>
    seedTrainers.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())), [q]
  );

  const filteredBrands = useMemo(() =>
    seedBrands.filter((b) => b.name.toLowerCase().includes(q.toLowerCase())), [q]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
          <Search size={18} className="text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search gyms, trainers, brands..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder-zinc-500"
          />
        </div>
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2">
          <MapPin size={18} className="text-zinc-500" />
          <input
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            placeholder="Location filter"
            className="bg-transparent outline-none text-sm text-white placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {['Gyms', 'Trainers', 'Brands', 'Sports Centers'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-sm border ${
              tab === t ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Gyms' || tab === 'Sports Centers' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGyms
            .filter((g) => (tab === 'Gyms' ? g.category !== 'Sports Center' : g.category === 'Sports Center'))
            .map((g) => (
            <div key={g.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium">{g.name}</div>
                  <div className="text-xs text-zinc-500">{g.location}</div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm">{g.rating}</span>
                </div>
              </div>
              <div className="mt-3 text-sm text-zinc-400">From ${g.price}/month</div>
              <button
                onClick={() => onSubscribe(g.name)}
                className="mt-4 w-full py-2 rounded-lg bg-emerald-500 text-black font-medium hover:opacity-90"
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'Trainers' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrainers.map((t) => (
            <div key={t.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="text-white font-medium">{t.name}</div>
              <div className="text-xs text-zinc-500">{t.expertise}</div>
              <div className="mt-3 text-sm text-zinc-400">${t.price}/session</div>
              <button
                onClick={() => onBookTrainer(t.name)}
                className="mt-4 w-full py-2 rounded-lg bg-cyan-500 text-black font-medium hover:opacity-90"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'Brands' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrands.map((b) => (
            <div key={b.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <div className="text-white font-medium">{b.name}</div>
              <div className="text-xs text-zinc-500">{b.product}</div>
              <div className="mt-3 text-sm text-zinc-400">${b.price}</div>
              <a
                href={b.url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block w-full text-center py-2 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700"
              >
                Buy Now
              </a>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
