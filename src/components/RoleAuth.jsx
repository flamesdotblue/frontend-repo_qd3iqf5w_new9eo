import React, { useState } from 'react';
import { User, Shield, Dumbbell, Store } from 'lucide-react';

const roles = [
  { value: 'Member', label: 'Gym Member', icon: User },
  { value: 'Owner', label: 'Gym Owner', icon: Shield },
  { value: 'Trainer', label: 'Trainer', icon: Dumbbell },
  { value: 'Brand', label: 'Brand', icon: Store },
];

export default function RoleAuth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');

  const submit = (e) => {
    e.preventDefault();
    const user = {
      id: `u_${Date.now()}`,
      name: name || 'Guest',
      email: email || 'guest@example.com',
      role,
      subscriptions: role === 'Member' ? ['Pulse Arena Gym'] : [],
      gyms: role === 'Owner' ? ['Pulse Arena Gym'] : [],
    };
    onLogin(user);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-[95%] max-w-xl bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="text-2xl font-semibold text-white">IndVend Fitness Ecosystem</div>
          <div className="text-zinc-400 text-sm">Login or Sign up to continue</div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Select your role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const Icon = r.icon;
                const active = role === r.value;
                return (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition ${
                      active
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-semibold hover:opacity-90"
          >
            Continue
          </button>
        </form>

        <div className="mt-6 text-xs text-center text-zinc-500">
          By continuing, you agree to our Terms and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
