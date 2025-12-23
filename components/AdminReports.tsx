
import React, { useState, useMemo } from 'react';
import { User, PuantajEntry, UserRole } from '../types';
import { ShieldCheck, User as UserIcon, ChevronLeft, ChevronRight, MessageSquare, BarChart3, Calendar as CalendarIcon } from 'lucide-react';

interface Props {
  users: User[];
  entries: PuantajEntry[];
}

const AdminReports: React.FC<Props> = ({ users, entries }) => {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const staffBalances = useMemo(() => {
    return users.map(user => {
      const userEntries = entries.filter(e => e.userId === user.id);
      const balance = userEntries.reduce((acc, curr) => acc + curr.amount, 0);
      return { ...user, balance };
    }).sort((a, b) => b.balance - a.balance);
  }, [users, entries]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1).getDay();
  const days = getDaysInMonth(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth());

  const selectedUserInfo = users.find(u => u.id === selectedUser);
  const selectedUserEntries = entries.filter(e => e.userId === selectedUser);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-[1200px] mx-auto px-4 lg:px-0">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100">
            <BarChart3 className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Dükkan Bilançosu</h2>
            <p className="text-slate-500 font-medium italic text-xs">Genel bakiye ve tarih bazlı analiz kanka.</p>
          </div>
        </div>
        
        <div className="bg-white p-2 rounded-[1.5rem] border border-slate-100 shadow-sm w-full lg:w-auto">
          <select 
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
            className="bg-slate-50 border border-slate-100 rounded-xl px-6 py-2.5 font-bold text-slate-700 outline-none text-sm cursor-pointer hover:bg-white transition-all w-full lg:min-w-[240px]"
          >
            <option value="all">Tüm Personel Özeti</option>
            {users.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {selectedUser === 'all' ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-8 border-b border-slate-50">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              Güncel Alacaklar
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 md:px-10 py-5">Personel</th>
                  <th className="hidden md:table-cell px-10 py-5 text-center">Yetki</th>
                  <th className="px-6 md:px-10 py-5 text-right">Bakiye</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staffBalances.map(staff => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 md:px-10 py-5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <img src={staff.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50" />
                        <div>
                          <p className="font-black text-slate-700 text-sm md:text-base">{staff.name}</p>
                          <span className="md:hidden text-[8px] font-black uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-500">{staff.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-10 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${staff.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 md:px-10 py-5 text-right font-black text-base md:text-lg">
                      <span className={staff.balance > 0 ? 'text-emerald-600' : staff.balance < 0 ? 'text-red-600' : 'text-slate-400'}>
                        {staff.balance.toLocaleString()} TL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 md:gap-6 flex-1">
              <img src={selectedUserInfo?.avatar} className="w-16 h-16 md:w-20 md:h-20 rounded-3xl border bg-slate-50" />
              <div>
                <h3 className="text-xl md:text-2xl font-black text-slate-800">{selectedUserInfo?.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hesap Detayları</p>
                <p className="text-xl md:text-2xl font-black text-indigo-600 mt-1 md:mt-2">
                  {(staffBalances.find(b => b.id === selectedUser)?.balance || 0).toLocaleString()} TL
                </p>
              </div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between min-w-[300px]">
              <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1)))} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"><ChevronLeft /></button>
              <div className="text-center font-black text-slate-800 uppercase tracking-widest text-xs md:text-sm">
                {currentCalendarDate.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
              </div>
              <button onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1)))} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"><ChevronRight /></button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 border border-slate-100 shadow-sm overflow-visible">
            {/* Weekday Labels - Hidden on Mobile */}
            <div className="hidden md:grid grid-cols-7 gap-2 mb-6 border-b border-slate-50 pb-4 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => <div key={d}>{d}</div>)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-visible">
              {/* Empty cells - Hidden on Mobile */}
              {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => (
                <div key={`empty-${i}`} className="hidden md:block h-28 bg-slate-50/20 rounded-[1.5rem]" />
              ))}
              
              {Array.from({ length: days }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentCalendarDate.getFullYear()}-${(currentCalendarDate.getMonth() + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                const dayEntries = selectedUserEntries.filter(e => e.date === dateStr);
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                // Mobilde sadece kaydı olan günleri gösterelim
                if (dayEntries.length === 0 && window.innerWidth < 768) return null;

                return (
                  <div key={dayNum} className={`min-h-[70px] md:h-28 border rounded-[1.5rem] p-3 flex flex-row md:flex-col items-center md:items-start group relative transition-all z-[1] hover:z-[50] ${isToday ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-50 bg-slate-50/20 hover:bg-white hover:shadow-xl hover:border-slate-200'}`}>
                    <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0 min-w-[40px]">
                      <span className={`text-base md:text-[10px] font-black ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{dayNum}</span>
                      <span className="md:hidden text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(dateStr).toLocaleString('tr-TR', { weekday: 'short' })}
                      </span>
                    </div>

                    <div className="mt-0 md:mt-1 space-y-1 flex-1 md:w-full overflow-visible flex flex-col items-end md:items-stretch">
                      {dayEntries.map(e => (
                        <div key={e.id} className={`text-[10px] md:text-[8px] font-black p-2 md:p-1.5 rounded-lg border relative group/entry cursor-help transition-all w-fit md:w-full ${e.amount < 0 ? 'bg-red-50 text-red-700 border-red-100' : 'bg-white text-slate-700 border-slate-100 shadow-sm'}`}>
                          <div className="flex justify-between items-center gap-2">
                            <span className="whitespace-nowrap">{e.amount > 0 ? '+' : ''}{e.amount.toLocaleString()}</span>
                            {e.note && <MessageSquare size={10} className={`${e.amount < 0 ? 'text-red-400' : 'text-indigo-400'}`} />}
                          </div>
                          
                          {e.note && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-slate-900 text-white text-[11px] rounded-2xl opacity-0 invisible group-hover/entry:opacity-100 group-hover/entry:visible transition-all duration-200 z-[100] min-w-[180px] max-w-[240px] shadow-2xl scale-95 group-hover/entry:scale-100 origin-bottom border border-white/10 pointer-events-none">
                               <div className="flex items-center gap-2 mb-2 pb-1 border-b border-white/10 opacity-50">
                                 <MessageSquare size={10} className="text-indigo-400" />
                                 <span className="uppercase tracking-widest font-black text-[8px]">Not</span>
                               </div>
                               <p className="font-bold leading-relaxed whitespace-pre-wrap">{e.note}</p>
                               <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty Month State for Mobile */}
            {window.innerWidth < 768 && selectedUserEntries.filter(e => {
              const d = new Date(e.date);
              return d.getMonth() === currentCalendarDate.getMonth() && d.getFullYear() === currentCalendarDate.getFullYear();
            }).length === 0 && (
              <div className="py-12 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm italic tracking-tight">Bu ay için herhangi bir kayıt bulunamadı kanka.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
