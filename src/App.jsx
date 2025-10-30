import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Modal from './components/Modal';
import RoleAuth from './components/RoleAuth';
import Marketplace from './components/Marketplace';
import { CheckCircle2, Send, Shield, UserCog } from 'lucide-react';

const formatDateTime = (d) => new Date(d).toLocaleString();

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedGymForScan, setSelectedGymForScan] = useState('');

  // Mock persistent storage in browser only
  const [attendance, setAttendance] = useState(() => {
    const raw = localStorage.getItem('iv_attendance');
    return raw ? JSON.parse(raw) : [];
  });
  const [ownerOffersSent, setOwnerOffersSent] = useState(0);
  const [ownerStaff, setOwnerStaff] = useState([{ id: 's1', name: 'Sam Manager', verified: true }]);
  const [trainerBookings, setTrainerBookings] = useState([
    { id: 'bk1', client: 'Jordan', date: new Date().toISOString(), trainer: 'You' },
  ]);

  useEffect(() => {
    localStorage.setItem('iv_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const onLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const onLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
  };

  // Attendance actions (Member)
  const openScanModal = () => {
    if (!currentUser) return;
    if (currentUser.role === 'Member' && currentUser.subscriptions?.length) {
      setSelectedGymForScan(currentUser.subscriptions[0]);
    } else if (currentUser.role === 'Owner' && currentUser.gyms?.length) {
      setSelectedGymForScan(currentUser.gyms[0]);
    } else {
      setSelectedGymForScan('Pulse Arena Gym');
    }
    setAttendanceModalOpen(true);
  };

  const markAttendance = () => {
    const entry = {
      id: `a_${Date.now()}`,
      user: currentUser?.name || 'Guest',
      role: currentUser?.role || 'Member',
      gym: selectedGymForScan || 'Pulse Arena Gym',
      timestamp: new Date().toISOString(),
      chainHash: Math.random().toString(36).slice(2, 10).toUpperCase(), // simulate blockchain hash
    };
    setAttendance((prev) => [entry, ...prev]);
    setAttendanceModalOpen(false);
  };

  // Owner utilities
  const ownerAttendance = useMemo(() => {
    if (!currentUser || currentUser.role !== 'Owner') return [];
    return attendance.filter((a) => currentUser.gyms?.includes(a.gym));
  }, [attendance, currentUser]);

  const todaysAttendanceCount = useMemo(() => {
    const today = new Date();
    return ownerAttendance.filter((a) => {
      const d = new Date(a.timestamp);
      return d.toDateString() === today.toDateString();
    }).length;
  }, [ownerAttendance]);

  const exportAttendanceCSV = () => {
    const rows = [
      ['id', 'user', 'role', 'gym', 'timestamp', 'chainHash'],
      ...attendance.map((a) => [a.id, a.user, a.role, a.gym, a.timestamp, a.chainHash]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'indvend_attendance.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Marketplace handlers
  const handleSubscribe = (gymName) => {
    if (!currentUser) return;
    if (currentUser.role !== 'Member') return;
    setCurrentUser((u) => ({ ...u, subscriptions: Array.from(new Set([...(u.subscriptions || []), gymName])) }));
    alert(`Subscribed to ${gymName}! (mock payment)`);
  };

  const handleBookTrainer = (trainerName) => {
    if (!currentUser) return;
    setTrainerBookings((prev) => [
      { id: `bk_${Date.now()}`, client: currentUser.name, date: new Date().toISOString(), trainer: trainerName },
      ...prev,
    ]);
    alert(`Session booked with ${trainerName}! Check your email for a Zoom link.`);
  };

  // Pages per role
  const MemberHome = () => {
    const myLogs = attendance.filter((a) => a.user === currentUser.name);
    const totalVisits = myLogs.length;
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard title="Total Visits" value={totalVisits} />
          <StatCard title="Subscribed Gyms" value={currentUser.subscriptions?.length || 0} />
          <StatCard title="Last Visit" value={myLogs[0] ? new Date(myLogs[0].timestamp).toLocaleDateString() : '—'} />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-white font-medium">Quick Actions</div>
            <button onClick={openScanModal} className="px-3 py-1.5 rounded bg-emerald-500 text-black text-sm font-medium">Scan QR / Tap NFC</button>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="text-white font-medium mb-3">Recent Attendance</div>
          <Table
            columns={['Gym', 'Timestamp', 'Hash']}
            rows={myLogs.slice(0, 6).map((a) => [a.gym, formatDateTime(a.timestamp), a.chainHash])}
          />
        </div>
      </div>
    );
  };

  const OwnerHome = () => {
    const totalMembers = new Set(ownerAttendance.map((a) => a.user)).size;
    return (
      <div className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard title="Total Members" value={totalMembers} />
          <StatCard title="Today’s Attendance" value={todaysAttendanceCount} />
          <StatCard title="Offers Sent" value={ownerOffersSent} />
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="text-white font-medium mb-3">Attendance Logs</div>
          <Table
            columns={["Member", "Gym", "Timestamp"]}
            rows={ownerAttendance.slice(0, 10).map((a) => [a.user, a.gym, formatDateTime(a.timestamp)])}
          />
          <div className="mt-4 flex gap-2">
            <button onClick={exportAttendanceCSV} className="px-3 py-2 rounded-lg bg-zinc-800 text-white text-sm">Export CSV</button>
            <button
              onClick={() => setOwnerOffersSent((n) => n + 1)}
              className="px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm flex items-center gap-2"
            >
              <Send size={16} /> Send Offer
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="text-white font-medium mb-3">Sub-admins</div>
          <div className="flex gap-2 mb-3">
            <input id="newStaff" placeholder="Add staff name" className="flex-1 px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500" />
            <button
              onClick={() => {
                const el = document.getElementById('newStaff');
                const val = el.value.trim();
                if (!val) return;
                setOwnerStaff((s) => [{ id: `s_${Date.now()}`, name: val, verified: false }, ...s]);
                el.value = '';
              }}
              className="px-3 py-2 rounded bg-zinc-800 text-white text-sm"
            >
              Add
            </button>
          </div>
          <Table
            columns={["Name", "Status"]}
            rows={ownerStaff.map((s) => [s.name, s.verified ? 'Verified' : 'Pending'])}
          />
          <div className="mt-2 text-xs text-zinc-500">Verification is manual for MVP. Toggle by clicking a row.</div>
        </div>
      </div>
    );
  };

  const TrainerHome = () => (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="text-white font-medium mb-3 flex items-center gap-2"><Shield size={16}/> Profile Setup</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <input className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" placeholder="Expertise (e.g., HIIT)" />
          <input className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" placeholder="Rate ($/session)" />
          <input className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" placeholder="Zoom link" />
        </div>
        <div className="mt-3 text-xs text-zinc-500">Details are for display only in this MVP.</div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="text-white font-medium mb-3 flex items-center gap-2"><UserCog size={16}/> Bookings</div>
        <Table
          columns={["Client", "Date", "Trainer"]}
          rows={trainerBookings.map((b) => [b.client, formatDateTime(b.date), b.trainer])}
        />
      </div>
    </div>
  );

  const BrandHome = () => (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
        <div className="text-white font-medium mb-3">Brand Profile</div>
        <div className="grid sm:grid-cols-2 gap-3">
          <input className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" placeholder="Brand name" />
          <input className="px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-sm text-white" placeholder="Store link" />
        </div>
        <div className="mt-3 text-xs text-zinc-500">Connect your storefront URL. Links open externally.</div>
      </div>
    </div>
  );

  const AttendancePage = () => {
    const myLogs = currentUser?.role === 'Owner' ? ownerAttendance : attendance.filter((a) => a.user === currentUser?.name);
    return (
      <div className="space-y-4">
        {currentUser?.role === 'Member' && (
          <div className="flex items-center justify-between bg-zinc-950 border border-zinc-800 rounded-xl p-4">
            <div>
              <div className="text-white font-medium">Scan QR / Tap NFC</div>
              <div className="text-xs text-zinc-500">Use this to mark your visit at a gym</div>
            </div>
            <button onClick={openScanModal} className="px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm font-medium">Open Scanner</button>
          </div>
        )}

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-white font-medium">Attendance Log</div>
            <button onClick={exportAttendanceCSV} className="px-3 py-1.5 rounded bg-zinc-800 text-white text-xs">Export CSV</button>
          </div>
          <Table columns={["User", "Gym", "Timestamp", "Hash"]} rows={myLogs.map((a) => [a.user, a.gym, formatDateTime(a.timestamp), a.chainHash])} />
        </div>
      </div>
    );
  };

  // Generic table and stat components inside App for simplicity
  const StatCard = ({ title, value }) => (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
      <div className="text-zinc-400 text-sm">{title}</div>
      <div className="text-white text-2xl font-semibold mt-1">{value}</div>
    </div>
  );

  const Table = ({ columns, rows }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-zinc-400 text-left border-b border-zinc-800">
            {columns.map((c) => (
              <th key={c} className="py-2 pr-4 font-medium">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-4 text-zinc-500">No data yet.</td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} className="border-b border-zinc-900 text-zinc-300">
                {r.map((cell, i) => (
                  <td key={i} className="py-2 pr-4">{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <Navbar currentUser={currentUser} currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={onLogout} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {!currentUser ? (
          <RoleAuth onLogin={onLogin} />
        ) : (
          <div className="space-y-6">
            {currentPage === 'home' && (
              currentUser.role === 'Member' ? <MemberHome /> : currentUser.role === 'Owner' ? <OwnerHome /> : currentUser.role === 'Trainer' ? <TrainerHome /> : <BrandHome />
            )}
            {currentPage === 'marketplace' && (
              <Marketplace onSubscribe={handleSubscribe} onBookTrainer={handleBookTrainer} />
            )}
            {currentPage === 'attendance' && <AttendancePage />}
            {currentPage === 'profile' && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
                <div className="text-white text-lg font-semibold">Profile</div>
                <div className="mt-2 text-sm text-zinc-400">Name: {currentUser.name}</div>
                <div className="text-sm text-zinc-400">Email: {currentUser.email}</div>
                <div className="text-sm text-zinc-400">Role: {currentUser.role}</div>
                {currentUser.role === 'Member' && (
                  <div className="mt-4">
                    <div className="text-white font-medium mb-2">Subscribed Gyms</div>
                    <ul className="list-disc list-inside text-sm text-zinc-300">
                      {(currentUser.subscriptions || []).map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Attendance Modal */}
      <Modal
        open={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        title="Mark Attendance"
        footer={
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-400">This simulates a secure on-chain timestamp.</div>
            <button onClick={markAttendance} className="px-3 py-2 rounded-lg bg-emerald-500 text-black text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={16} /> Confirm
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <div className="text-sm text-zinc-400 mb-1">Select Gym</div>
            <select
              value={selectedGymForScan}
              onChange={(e) => setSelectedGymForScan(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-white text-sm"
            >
              {(
                currentUser?.role === 'Member' ? currentUser?.subscriptions || [] : currentUser?.gyms || ['Pulse Arena Gym']
              ).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <div className="text-white font-medium">Scan Result</div>
            <div className="text-sm text-zinc-400">QR/NFC detected for <span className="text-emerald-400">{selectedGymForScan || '—'}</span></div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
