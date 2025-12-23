
import React, { useState, useEffect } from 'react';
import { User, UserRole, PuantajEntry } from './types';
import AdminPersonnel from './components/AdminPersonnel';
import AdminPuantaj from './components/AdminPuantaj';
import AdminReports from './components/AdminReports';
import StaffPortal from './components/StaffPortal';
import { db } from './services/supabaseService';
import { Users, ClipboardList, BarChart3, LogOut, Briefcase, RefreshCw } from 'lucide-react';

interface Bubble {
  id: number;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [entries, setEntries] = useState<PuantajEntry[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminTab, setAdminTab] = useState<'personnel' | 'puantaj' | 'reports'>('puantaj');
  const [loading, setLoading] = useState(true);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, e] = await Promise.all([db.getUsers(), db.getEntries()]);
      
      if (u.length === 0) {
        const admin: User = { 
          id: 'admin', 
          name: 'Patron (Yönetici)', 
          role: UserRole.ADMIN, 
          hourlyRate: 0, 
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' 
        };
        await db.upsertUser(admin);
        setUsers([admin]);
      } else {
        setUsers(u);
      }
      setEntries(e);
    } catch (err: any) {
      console.error("Veri yükleme hatası:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Baloncuk Efekti Dinleyicisi
    const handleClick = (e: MouseEvent) => {
      const newBubble = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY
      };
      setBubbles(prev => [...prev, newBubble]);
      
      // 4 saniye sonra balonu temizle (animasyon süresi kadar)
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      }, 4000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => setCurrentUser(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <RefreshCw className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="font-bold tracking-widest text-sm uppercase opacity-50 text-center px-4 tracking-[0.3em]">
          Bulut Verileri Senkronize Ediliyor...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans relative overflow-hidden">
        {/* Baloncuklar buraya da gelsin */}
        {bubbles.map(b => (
          <div key={b.id} className="bubble-effect bg-indigo-500/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full font-black text-white text-xs uppercase tracking-[0.3em] shadow-2xl">
            PİÇİ SOY!
          </div>
        ))}
        
        <div className="bg-white rounded-[3rem] shadow-2xl p-10 max-w-md w-full animate-in zoom-in-95 z-10">
          <div className="text-center mb-8">
            <div className="bg-indigo-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200">
              <Briefcase className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Puantaj Pro</h1>
            <p className="text-slate-500 mt-2 font-medium">Bulut tabanlı akıllı takip sistemi.</p>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {users.map(user => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full flex items-center p-5 border border-slate-100 hover:border-indigo-500 bg-slate-50 rounded-3xl transition-all hover:shadow-lg group text-left"
              >
                <img src={user.avatar} className="w-12 h-12 rounded-2xl mr-4 bg-white shadow-sm border border-slate-100" alt={user.name} />
                <div className="flex-1">
                  <p className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{user.role === UserRole.ADMIN ? 'Yönetici' : 'Personel'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative">
      {/* Baloncuklar */}
      {bubbles.map(b => (
        <div key={b.id} className="bubble-effect bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 px-6 py-3 rounded-full font-black text-indigo-700 text-sm uppercase tracking-[0.3em] shadow-2xl">
          PİÇİ SOY!
        </div>
      ))}

      {/* Navigasyon - Mobilde sticky değil, masaüstünde sticky */}
      <nav className="w-full lg:w-80 bg-white border-b lg:border-r border-slate-100 flex flex-col lg:sticky lg:top-0 lg:h-screen z-10 shrink-0">
        <div className="p-8 lg:p-10">
          <h2 className="text-2xl font-black flex items-center gap-3 text-slate-800">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100"><Briefcase className="text-white w-6 h-6" /></div>
            Puantaj Pro
          </h2>
        </div>

        <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible px-4 lg:px-6 space-x-2 lg:space-x-0 lg:space-y-2 pb-4 lg:pb-0 no-scrollbar">
          {currentUser.role === UserRole.ADMIN ? (
            <>
              <button
                onClick={() => setAdminTab('puantaj')}
                className={`flex-1 lg:w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all whitespace-nowrap ${adminTab === 'puantaj' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
              >
                <ClipboardList className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm md:text-base">Puantaj</span>
              </button>
              <button
                onClick={() => setAdminTab('personnel')}
                className={`flex-1 lg:w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all whitespace-nowrap ${adminTab === 'personnel' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
              >
                <Users className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm md:text-base">Personel</span>
              </button>
              <button
                onClick={() => setAdminTab('reports')}
                className={`flex-1 lg:w-full flex items-center gap-3 md:gap-4 px-4 md:px-6 py-3 md:py-4 rounded-2xl transition-all whitespace-nowrap ${adminTab === 'reports' ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 font-bold'}`}
              >
                <BarChart3 className="w-5 h-5 shrink-0" />
                <span className="font-bold text-sm md:text-base">Raporlar</span>
              </button>
            </>
          ) : (
            <div className="flex-1 lg:w-full px-6 py-4 bg-indigo-50 text-indigo-600 rounded-3xl font-black text-xs uppercase tracking-widest text-center">
              Personel Paneli
            </div>
          )}
        </div>

        <div className="p-6 lg:p-8 mt-auto border-t border-slate-50 bg-white">
          <div className="flex items-center gap-4 mb-4 lg:mb-8 bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <img src={currentUser.avatar} className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl border-2 border-white shadow-sm" alt="profile" />
            <div className="overflow-hidden">
              <p className="text-xs lg:text-sm font-black truncate text-slate-800">{currentUser.name}</p>
              <p className="text-[9px] lg:text-[10px] font-black uppercase text-indigo-500 tracking-tighter">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 lg:px-6 lg:py-4 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-all font-black text-[11px] lg:text-sm uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
            Çıkış
          </button>
        </div>
      </nav>

      {/* Ana İçerik - Mobilde kendi içinde scroll etmiyor, pencere scrollunu kullanıyor */}
      <main className="flex-1 p-4 md:p-6 lg:p-12 lg:overflow-y-auto lg:h-screen custom-scrollbar mobile-scroll-fix">
        {currentUser.role === UserRole.ADMIN ? (
          <>
            {adminTab === 'personnel' && <AdminPersonnel users={users} setUsers={setUsers} />}
            {adminTab === 'puantaj' && <AdminPuantaj users={users} entries={entries} setEntries={setEntries} />}
            {adminTab === 'reports' && <AdminReports users={users} entries={entries} />}
          </>
        ) : (
          <StaffPortal user={currentUser} entries={entries} />
        )}
      </main>
    </div>
  );
};

export default App;
