
import React, { useState, useMemo } from 'react';
import { User, PuantajEntry } from '../types';
import { db } from '../services/supabaseService';
import { Coins, Calendar, ArrowRight, CheckCircle2, RefreshCw, AlertCircle, Info, Receipt, Trash2, X, ShieldAlert } from 'lucide-react';

interface Props {
  users: User[];
  entries: PuantajEntry[];
  setEntries: React.Dispatch<React.SetStateAction<PuantajEntry[]>>;
}

const AdminTips: React.FC<Props> = ({ users, entries, setEntries }) => {
  const [selectedSunday, setSelectedSunday] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() + (day === 0 ? 0 : 7 - day);
    const lastSun = new Date(today.setDate(diff));
    return lastSun.toISOString().split('T')[0];
  });

  const [totalTipPool, setTotalTipPool] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Reset States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmationInput, setResetConfirmationInput] = useState('');
  const expectedResetPhrase = "tipi sıfırla";

  // Haftalık aralığı hesapla (Pazartesi'den Pazar'a)
  const weekRange = useMemo(() => {
    const end = new Date(selectedSunday);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { 
      start: start.toISOString().split('T')[0], 
      end: end.toISOString().split('T')[0] 
    };
  }, [selectedSunday]);

  // Seçili Pazar günü için zaten dağıtılmış olan bahşiş kayıtlarını bul
  const alreadyDistributedTips = useMemo(() => {
    return entries.filter(e => e.type === 'TIP' && e.date === selectedSunday);
  }, [entries, selectedSunday]);

  // Personel bazlı haftalık çalışma saatlerini hesapla
  const staffWeeklyHours = useMemo(() => {
    return users.map(user => {
      const userWeekEntries = entries.filter(e => {
        // Bahşiş dağıtımı için sadece saat içeren iş kayıtlarını sayıyoruz
        return e.userId === user.id && e.date >= weekRange.start && e.date <= weekRange.end && e.hours;
      });
      const totalHours = userWeekEntries.reduce((acc, curr) => acc + (curr.hours || 0), 0);
      return { ...user, totalHours };
    });
  }, [users, entries, weekRange]);

  const totalShopHours = staffWeeklyHours.reduce((acc, curr) => acc + curr.totalHours, 0);
  
  // Saat başına düşen oran
  const hourlyTipRate = useMemo(() => {
    if (totalTipPool) {
      return totalShopHours > 0 ? (parseFloat(totalTipPool) || 0) / totalShopHours : 0;
    }
    if (alreadyDistributedTips.length > 0 && totalShopHours > 0) {
      const totalDistributed = alreadyDistributedTips.reduce((acc, curr) => acc + curr.amount, 0);
      return totalDistributed / totalShopHours;
    }
    return 0;
  }, [totalTipPool, totalShopHours, alreadyDistributedTips]);

  const handleDistribute = async () => {
    const pool = parseFloat(totalTipPool);
    if (isNaN(pool) || pool <= 0 || totalShopHours === 0) return;

    if (alreadyDistributedTips.length > 0) {
      const confirmRetry = window.confirm("Kanka bu Pazar için zaten bahşiş girişi var. Üzerine eklemek istediğine emin misin?");
      if (!confirmRetry) return;
    }

    setBusy(true);
    try {
      const newEntries: PuantajEntry[] = [];
      for (const staff of staffWeeklyHours) {
        if (staff.totalHours > 0) {
          const tipAmount = Math.floor(staff.totalHours * hourlyTipRate);
          const entry: PuantajEntry = {
            id: Math.random().toString(36).substr(2, 9),
            userId: staff.id,
            type: 'TIP',
            amount: tipAmount,
            date: selectedSunday,
            note: `${weekRange.start} - ${weekRange.end} Haftalık Bahşiş (${staff.totalHours} Saat)`
          };
          await db.upsertEntry(entry);
          newEntries.push(entry);
        }
      }
      setEntries(prev => [...prev, ...newEntries]);
      setSuccess(true);
      setTotalTipPool('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleResetTips = async () => {
    if (resetConfirmationInput !== expectedResetPhrase) return;
    
    setBusy(true);
    try {
      await db.deleteTipsByDate(selectedSunday);
      setEntries(prev => prev.filter(e => !(e.type === 'TIP' && e.date === selectedSunday)));
      setShowResetModal(false);
      setResetConfirmationInput('');
      setTotalTipPool('');
    } catch (err) {
      console.error("Sıfırlama hatası:", err);
      alert("Sıfırlarken bir hata oluştu kanka.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1100px] mx-auto pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-100">
            <Coins className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Bahşiş (Tip Box)</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Haftalık Saat Bazlı Dağıtım</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto">
          <Calendar className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={selectedSunday} 
            onChange={e => {
              setSelectedSunday(e.target.value);
              setTotalTipPool(''); 
            }}
            className="font-black text-slate-700 outline-none text-sm cursor-pointer px-2 flex-1 md:flex-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Panel: Giriş ve Özet */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              Tip Box Hesabı
            </h3>
            
            <div className="space-y-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Haftalık Toplam Mesai</span>
                  <span className="font-black text-slate-800 text-xl">{totalShopHours} <span className="text-xs text-slate-400">SAAT</span></span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase italic">
                  Aralık: {weekRange.start} / {weekRange.end}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Yeni Tip Girişi (TL)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Elde sayılan miktar..."
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-3xl outline-none font-black text-3xl transition-all"
                    value={totalTipPool}
                    onChange={e => setTotalTipPool(e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300">TL</div>
                </div>
              </div>

              {hourlyTipRate > 0 && (
                <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-center">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Hesaplanan / Dağıtılan Oran</p>
                  <p className="text-2xl font-black text-amber-700">{hourlyTipRate.toFixed(2)} TL / Saat</p>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button 
                  disabled={busy || !totalTipPool || totalShopHours === 0}
                  onClick={handleDistribute}
                  className="w-full py-6 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
                >
                  {busy ? <RefreshCw className="animate-spin" /> : success ? <CheckCircle2 className="text-emerald-400" /> : <Coins />}
                  {success ? 'DAĞITIM BAŞARILI!' : 'DAĞITIMI ONAYLA'}
                </button>

                {alreadyDistributedTips.length > 0 && (
                  <button 
                    disabled={busy}
                    onClick={() => setShowResetModal(true)}
                    className="w-full py-4 rounded-2xl bg-white border-2 border-red-50 text-red-500 font-black uppercase tracking-widest text-[10px] hover:bg-red-50 transition-all flex items-center justify-center gap-2 group"
                  >
                    <Trash2 size={14} className="group-hover:animate-bounce" />
                    Bahşiş Kayıtlarını Sıfırla
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2.5rem] flex gap-4 text-blue-800">
            <Info className="shrink-0 w-6 h-6 text-blue-500" />
            <p className="text-xs font-bold leading-relaxed">
              Kanka, bahşişler "TIP" türünde kaydedilir ama maaş bakiyesine eklenmez. Burası sadece adaleti sağlamak ve kimin ne kadar aldığını takip etmek içindir.
            </p>
          </div>
        </div>

        {/* Sağ Panel: Dağılım Listesi */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-slate-200 rounded-full" />
              Pay Dağılımı {totalTipPool ? '(Önizleme)' : '(Kayıtlı)'}
            </h3>
            {alreadyDistributedTips.length > 0 && !totalTipPool && (
              <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Dağıtım Tamamlandı</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-slate-50 custom-scrollbar">
            {staffWeeklyHours.map(staff => {
              const existingRecord = alreadyDistributedTips.find(t => t.userId === staff.id);
              const previewShare = Math.floor(staff.totalHours * hourlyTipRate);
              const displayAmount = totalTipPool ? previewShare : (existingRecord?.amount || 0);
              
              return (
                <div key={staff.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <img src={staff.avatar} className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm" />
                    <div>
                      <p className="font-bold text-slate-800">{staff.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.totalHours} Saat Mesai</p>
                        {existingRecord && !totalTipPool && <div className="w-1 h-1 rounded-full bg-slate-300" />}
                        {existingRecord && !totalTipPool && <p className="text-[9px] font-bold text-emerald-500 uppercase">ÖDENDİ</p>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       <p className={`font-black text-xl ${displayAmount > 0 ? (totalTipPool ? 'text-indigo-500' : 'text-emerald-600') : 'text-slate-200'}`}>
                        {displayAmount > 0 ? `+${displayAmount.toLocaleString()}` : '0'}
                      </p>
                      <span className="text-[10px] font-black text-slate-300 uppercase">TL</span>
                    </div>
                  </div>
                </div>
              );
            })}
            {staffWeeklyHours.length === 0 && (
              <div className="p-10 text-center text-slate-400 font-bold italic">
                Bu hafta için çalışma kaydı bulunamadı kanka.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-8">
              <div className="bg-red-50 p-4 rounded-3xl text-red-600">
                <ShieldAlert size={32} />
              </div>
              <button onClick={() => setShowResetModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Kayıtları Sıfırla</h3>
            <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
              Kanka, bu Pazar günü için dağıtılan tüm bahşişleri kalıcı olarak sileceksin. Geri dönüşü yok. Devam etmek için aşağıdaki boşluğa <span className="text-red-600 font-mono">"{expectedResetPhrase}"</span> yaz.
            </p>

            <div className="space-y-4">
              <input 
                type="text"
                autoFocus
                placeholder="Buraya yaz kanka..."
                className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 focus:border-red-500 rounded-2xl outline-none font-bold text-center transition-all"
                value={resetConfirmationInput}
                onChange={e => setResetConfirmationInput(e.target.value)}
              />

              <button 
                disabled={busy || resetConfirmationInput !== expectedResetPhrase}
                onClick={handleResetTips}
                className="w-full py-5 rounded-2xl bg-red-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:bg-slate-100 disabled:text-slate-300 disabled:shadow-none"
              >
                {busy ? <RefreshCw className="animate-spin" /> : <Trash2 size={20} />}
                KAYITLARI TEMİZLE
              </button>
              
              <button onClick={() => setShowResetModal(false)} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600">
                VAZGEÇ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTips;
