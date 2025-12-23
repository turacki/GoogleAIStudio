
import React, { useState } from 'react';
import { User, PuantajEntry } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Info, Wallet, TrendingUp, ReceiptText, MessageSquare } from 'lucide-react';

interface Props {
  user: User;
  entries: PuantajEntry[];
}

const StaffPortal: React.FC<Props> = ({ user, entries }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const myEntries = entries.filter(e => e.userId === user.id);
  
  const totalBalance = myEntries.reduce((acc, curr) => acc + curr.amount, 0);

  const monthEarnings = myEntries
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear() && e.amount > 0;
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  const monthDeductions = myEntries
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear() && e.amount < 0;
    })
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Selam, {user.name.split(' ')[0]}!</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Kişisel puantaj ve bakiye özetin kanka.</p>
        </div>
        <div className="bg-white p-2 md:p-4 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm w-full md:w-auto justify-between">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronLeft /></button>
          <span className="font-black text-slate-700 min-w-[120px] text-center uppercase tracking-widest text-xs md:text-sm">
            {currentMonth.toLocaleString('tr-TR', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-indigo-600 p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 flex flex-col justify-between">
          <div>
            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-4"><Wallet className="w-5 h-5" /></div>
            <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Kalan Toplam Bakiye</p>
          </div>
          <p className="text-3xl md:text-4xl font-black mt-4">{totalBalance.toLocaleString()} TL</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bu Ayki Kazanç</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-800 mt-4">+{monthEarnings.toLocaleString()} TL</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="bg-red-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-red-600"><ReceiptText className="w-5 h-5" /></div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Bu Ayki Ödemeler</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-800 mt-4">-{monthDeductions.toLocaleString()} TL</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-10 border border-slate-100 shadow-xl relative overflow-visible">
        {/* Weekday Headers - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-7 gap-2 mb-6">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <div key={d} className="text-center text-xs font-black text-slate-300 uppercase py-2 tracking-widest">{d}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 overflow-visible">
          {/* Empty cells - Hidden on Mobile */}
          {Array.from({ length: firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1 }).map((_, i) => (
            <div key={`empty-${i}`} className="hidden md:block h-32" />
          ))}

          {Array.from({ length: days }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const dayEntries = myEntries.filter(e => e.date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;
            
            // Mobilde sadece kaydı olan günleri gösterelim ki ajanda gibi şık dursun
            if (dayEntries.length === 0 && window.innerWidth < 768) return null;

            return (
              <div 
                key={dayNum} 
                className={`min-h-[80px] md:h-32 border rounded-[2rem] p-4 transition-all flex flex-row md:flex-col justify-between items-center md:items-start group/day relative z-[1] hover:z-[99] ${
                  isToday ? 'border-indigo-500 bg-indigo-50/20 shadow-inner' : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200 hover:shadow-lg'
                }`}
              >
                <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                  <span className={`text-base md:text-sm font-black ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{dayNum}</span>
                  <span className="md:hidden text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {new Date(dateStr).toLocaleString('tr-TR', { weekday: 'short' })}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 mt-1 flex-1 md:w-full overflow-visible relative items-end md:items-stretch">
                  {dayEntries.map(e => (
                    <div 
                      key={e.id} 
                      className="relative group/entry z-[2] hover:z-[100] w-fit md:w-full"
                    >
                      <div 
                        className={`text-[10px] md:text-[9px] font-black px-3 py-2 md:py-1.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-help ${
                          e.amount < 0 
                            ? 'bg-red-50 text-red-700 border-red-100' 
                            : 'bg-white text-slate-700 border-slate-100 shadow-sm'
                        }`}
                      >
                        <span className="whitespace-nowrap">{e.amount > 0 ? '+' : ''}{e.amount} TL</span>
                        {e.note && (
                          <MessageSquare size={10} className={`${e.amount < 0 ? 'text-red-400' : 'text-indigo-400'}`} />
                        )}
                      </div>
                      
                      {e.note && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-5 py-4 bg-slate-900 text-white text-[11px] rounded-[1.5rem] opacity-0 invisible group-hover/entry:opacity-100 group-hover/entry:visible transition-all duration-300 pointer-events-none z-[99999] shadow-2xl min-w-[200px] max-w-[280px] scale-90 group-hover/entry:scale-100 origin-bottom border border-white/10">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10 opacity-50">
                            <MessageSquare size={12} className="text-indigo-400" />
                            <span className="uppercase tracking-[0.2em] font-black text-[9px]">Not</span>
                          </div>
                          <p className="font-bold leading-relaxed whitespace-pre-wrap break-words text-indigo-50 text-[12px]">
                            {e.note}
                          </p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-slate-900" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Mobilde eğer ay boşsa mesaj gösterelim */}
        {window.innerWidth < 768 && myEntries.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
        }).length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold text-sm italic">Bu ay henüz bir kaydın yok kanka.</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-4 md:gap-6 text-amber-900 shadow-sm">
        <div className="bg-amber-100 p-4 rounded-2xl h-fit w-fit shadow-sm"><Info className="w-6 h-6 text-amber-600" /></div>
        <div>
          <p className="font-black text-xl">Dükkan Takip Kılavuzu</p>
          <p className="mt-2 font-medium opacity-80 leading-relaxed text-sm md:text-base">
            Kanka, bakiyen senin dükkandaki toplam alacağındır. Mobilde sadece kayıt olan günleri ajanda şeklinde görebilirsin. Notların üzerine gelerek detayları oku!
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffPortal;
