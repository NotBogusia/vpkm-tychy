import React, { useState, useEffect } from 'react';
import { 
  Bus, User, Calendar, Shield, Clock, MapPin, 
  CheckCircle, AlertTriangle, LogOut, Send, 
  Plus, Users, Layers, TrendingUp, Coffee, Fuel
} from 'lucide-react';

export default function App() {
  // Stan autentykacji i nawigacji
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dane logowania (formularz)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Stan dla formularza raportów kierowcy
  const [reportLine, setReportLine] = useState('75');
  const [reportBus, setReportBus] = useState('Solaris Urbino 18 (#421)');
  const [reportKm, setReportKm] = useState('');
  const [reportStatus, setReportStatus] = useState('Bez zakłóceń');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Stan dla panelu admina (dodawanie zleceń)
  const [adminRoutes, setAdminRoutes] = useState([
    { id: 1, line: 'A', driver: 'Jan Kowalski', bus: 'Trollino 12 (#021)', shift: 'I (05:00 - 13:00)', route: 'Towarowa -> Dworzec PKP', status: 'W trasie' },
    { id: 2, line: '75', driver: 'Mateusz Nowak', bus: 'Solaris Urbino 18 (#421)', shift: 'II (13:00 - 21:00)', route: 'Tychy Towarowa -> Mikołów Dw. PKP', status: 'Oczekuje' },
    { id: 3, line: '21', driver: 'Anna Wójcik', bus: 'MAN Lion\'s City (#302)', shift: 'I (04:30 - 12:30)', route: 'Szpital Wojewódzki -> Wilkowyje', status: 'Zakończona' },
  ]);
  const [newLine, setNewLine] = useState('B');
  const [newDriver, setNewDriver] = useState('');
  const [newBus, setNewBus] = useState('');

  // Obsługa logowania
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'kierowca@vpkm.pl' && password === 'tychy') {
      setUser({ name: 'Mateusz Nowak', role: 'driver', id: 'K-320', rank: 'Starszy Kierowca', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' });
      setIsLoggedIn(true);
      setActiveTab('dashboard');
      setLoginError('');
    } else if (email === 'admin@vpkm.pl' && password === 'tychy') {
      setUser({ name: 'Krzysztof Szef', role: 'admin', id: 'A-001', rank: 'Dyspozytor Główny', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' });
      setIsLoggedIn(true);
      setActiveTab('admin-panel');
      setLoginError('');
    } else {
      setLoginError('Błędny login lub hasło! Użyj: kierowca@vpkm.pl lub admin@vpkm.pl (hasło: tychy)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  const handleAddRoute = (e) => {
    e.preventDefault();
    if (!newDriver || !newBus) return;
    const route = {
      id: adminRoutes.length + 1,
      line: newLine,
      driver: newDriver,
      bus: newBus,
      shift: 'I (06:00 - 14:00)',
      route: 'Pętla Zajezdnia -> Losowa Trasa',
      status: 'Oczekuje'
    };
    setAdminRoutes([route, ...adminRoutes]);
    setNewDriver('');
    setNewBus('');
  };

  // --- WIDOK LOGOWANIA ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden font-sans">
        {/* Animowane tła neonowe */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse duration-[6000ms]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] animate-pulse duration-[4000ms]"></div>

        <div className="w-full max-w-md p-8 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl relative z-10 transform transition-all duration-500 hover:scale-[1.01]">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-2xl shadow-lg shadow-emerald-500/20 mb-4 animate-bounce duration-[3000ms]">
              <Bus className="h-8 w-8 text-slate-950" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              vPKM <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">TYCHY</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2">Wirtualny Panel Zarządzania Ruchem</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">E-mail Służbowy</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                placeholder="np. kierowca@vpkm.pl"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Hasło dostępu</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98] transition-all transform duration-150 mt-2 text-sm uppercase tracking-wider"
            >
              Zaloguj do bazy danych
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-800/60 pt-4">
            Wersja systemu v4.2.0 • Rok 2026
          </div>
        </div>
      </div>
    );
  }

  // --- WIDOK GLÓWNY (PO ZALOGOWANIU) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* MENU BOCZNE (SIDEBAR) */}
      <aside className="w-72 bg-slate-900/40 border-r border-slate-800/80 backdrop-blur-md p-6 flex flex-col justify-between hidden md:flex">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-amber-500 rounded-xl">
              <Bus className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h2 className="font-black text-xl tracking-tight text-white">vPKM TYCHY</h2>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Silesia Cloud</span>
            </div>
          </div>

          {/* Profil Mini */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl mb-8 flex items-center gap-3">
            <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20" />
            <div className="overflow-hidden">
              <h4 className="font-bold text-sm text-white truncate">{user.name}</h4>
              <p className="text-xs text-slate-400 truncate">{user.rank}</p>
              <span className="text-[10px] text-amber-400 font-mono block mt-0.5">{user.id}</span>
            </div>
          </div>

          {/* Nawigacja */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2 px-2">Menu Główne</p>
            
            {user.role === 'driver' && (
              <>
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-4 border-emerald-500 pl-3' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Layers className="h-4 w-4" /> Pulpit Kierowcy
                </button>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'schedule' ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-4 border-emerald-500 pl-3' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Calendar className="h-4 w-4" /> Mój Rozkład Jazdy
                </button>
                <button 
                  onClick={() => setActiveTab('report')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'report' ? 'bg-gradient-to-r from-emerald-500/20 to-transparent text-emerald-400 border-l-4 border-emerald-500 pl-3' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Send className="h-4 w-4" /> Karta Drogowa / Raport
                </button>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <button 
                  onClick={() => setActiveTab('admin-panel')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${activeTab === 'admin-panel' ? 'bg-gradient-to-r from-amber-500/20 to-transparent text-amber-400 border-l-4 border-amber-500 pl-3' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}
                >
                  <Shield className="h-4 w-4" /> Centrala Dyspozytorska
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Przycisk Wyloguj */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="h-4 w-4" /> Wyloguj z systemu
        </button>
      </aside>

      {/* GLÓWNY PANEL ZAWARTOSCI */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        
        {/* Górny pasek statusu */}
        <header className="flex justify-between items-center mb-8 bg-slate-900/30 p-4 border border-slate-800/60 rounded-2xl backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-white">
              {activeTab === 'dashboard' && 'Witaj na służbie, Mateusz!'}
              {activeTab === 'schedule' && 'Twój grafik dzienny'}
              {activeTab === 'report' && 'Rozliczenie karty drogowej'}
              {activeTab === 'admin-panel' && 'Konsola Administratora / Dyspozytora'}
            </h2>
            <p className="text-xs text-slate-400">Aktualna data systemowa: <span className="font-mono text-emerald-400">2026-06-17</span></p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">Serwer Live</span>
          </div>
        </header>

        {/* --- TAB: PULPIT KIEROWCY (DASHBOARD) --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Statystyki klockowe z animacją hover */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="flex justify-between items-start">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Przejechane km</p>
                  <TrendingUp className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-black text-white mt-2 font-mono">14,250 <span className="text-xs text-slate-500">km</span></h3>
                <p className="text-[11px] text-emerald-400 mt-1">+230 km w tym tygodniu</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="flex justify-between items-start">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Godziny za kółkiem</p>
                  <Clock className="h-5 w-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-black text-white mt-2 font-mono">312 <span className="text-xs text-slate-500">h</span></h3>
                <p className="text-[11px] text-slate-400 mt-1">Status: Odpoczynek</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="flex justify-between items-start">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Aktualny Wóz</p>
                  <Bus className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-white mt-2 truncate">Solaris U18</h3>
                <p className="text-[11px] text-cyan-400 font-mono">Boczny: #421</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="flex justify-between items-start">
                  <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Ocena Rankingu</p>
                  <CheckCircle className="h-5 w-5 text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-black text-white mt-2 font-mono">99.4 <span className="text-xs text-slate-500">%</span></h3>
                <p className="text-[11px] text-purple-400 mt-1">Wzorowy współczynnik spalania</p>
              </div>
            </div>

            {/* Dzisiejsza Służba (Główna karta kierowcy) */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Bus className="h-64 w-64 text-white" />
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-4">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    Aktywne Przydzielone Zadanie
                  </span>
                  <div>
                    <h3 className="text-3xl font-black text-white flex items-center gap-3">
                      <span className="px-3 py-1 bg-amber-400 text-slate-950 font-mono text-2xl rounded-xl">75</span>
                      Kierunek: Mikołów Dworzec PKP
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-400" /> Trasa: Tychy Towarowa przez: Wartogłowiec, Tychy Dw. PKP, Wyry
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[250px] space-y-2 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Zmiana:</span> <span className="text-white font-bold">II (Popołudniowa)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Godziny:</span> <span className="text-white">13:00 - 21:00</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Pojazd:</span> <span className="text-cyan-400">Solaris Urbino 18 (#421)</span>
                  </div>
                </div>
              </div>

              {/* Oś czasu rozkładu jazdy na dzisiaj */}
              <div className="mt-8 pt-6 border-t border-slate-800/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Planowany Przebieg Służby i Przerwy</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 relative">
                    <span className="text-[10px] font-mono text-emerald-400 block mb-1">13:00</span>
                    <p className="text-xs font-bold text-white">Pobranie wozu z zajezdni</p>
                    <p className="text-[11px] text-slate-500">Tychy Towarowa (Zajezdnia PKM)</p>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] font-mono text-emerald-400 block mb-1">13:15 - 15:45</span>
                    <p className="text-xs font-bold text-white">Kółko nr 1 i nr 2</p>
                    <p className="text-[11px] text-slate-500">Linia 75 zgodnie z GPS</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2">
                    <Coffee className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 block mb-1">15:45 - 16:15</span>
                      <p className="text-xs font-bold text-white">Przerwa ustawowa</p>
                      <p className="text-[11px] text-slate-400">Mikołów Dworzec PKP (Pętla)</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">16:15 - 21:00</span>
                    <p className="text-xs font-bold text-slate-400">Kontynuacja i Zjazd</p>
                    <p className="text-[11px] text-slate-500">Czyszczenie i zdanie pojazdu</p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: MÓJ ROZKŁAD JAZDY --- */}
        {activeTab === 'schedule' && (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
              <h3 className="font-bold text-white">Archiwum i nadchodzące kursy</h3>
              <span className="text-xs text-slate-400 font-mono">Wyświetlono 3 ostatnie pozycje</span>
            </div>
            <div className="divide-y divide-slate-800">
              
              <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-amber-400 text-slate-950 font-mono text-xl font-black rounded-xl flex items-center justify-center">75</div>
                  <div>
                    <h4 className="font-bold text-white">Tychy Towarowa ⇄ Mikołów Dw. PKP</h4>
                    <p className="text-xs text-slate-400">Dzisiaj • Zmiana Popołudniowa</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Wóz</span>
                    <span className="text-slate-300">#421</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Status</span>
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-md">Oczekuje</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-500 text-slate-950 font-mono text-xl font-black rounded-xl flex items-center justify-center">A</div>
                  <div>
                    <h4 className="font-bold text-white">Towarowa ⇄ Dworzec PKP <span className="text-[10px] uppercase text-emerald-400 font-bold ml-2 bg-emerald-500/10 px-1.5 py-0.5 rounded">Trolejbus</span></h4>
                    <p className="text-xs text-slate-400">Wczoraj • Zmiana Poranna</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Wóz</span>
                    <span className="text-slate-300">#018</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Status</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">Zatwierdzona</span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-slate-800 text-slate-400 font-mono text-xl font-black rounded-xl flex items-center justify-center">21</div>
                  <div>
                    <h4 className="font-bold text-slate-400">Szpital Wojewódzki ⇄ Wilkowyje</h4>
                    <p className="text-xs text-slate-500">14 Cze 2026 • Zmiana Nocna</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Wóz</span>
                    <span className="text-slate-500">#302</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block uppercase text-[9px] tracking-wider">Status</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">Zatwierdzona</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- TAB: KARTA DROGOWA / RAPORT --- */}
        {activeTab === 'report' && (
          <div className="max-w-2xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md animate-fadeIn">
            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full mb-2">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h3 className="text-2xl font-bold text-white">Karta drogowa wysłana!</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">Raport trafił na biurko dyspozytora głównego. Po weryfikacji kilometry i punkty zostaną dopisane do Twojego profilu.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm transition-all"
                >
                  Złóż kolejny raport
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Rozliczenie Zakończonej Trasy</h3>
                  <p className="text-xs text-slate-400">Wprowadź precyzyjne dane po zaparkowaniu wozu na zajezdni.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Linia</label>
                    <select 
                      value={reportLine} 
                      onChange={(e) => setReportLine(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="75">Linia 75 (Autobus)</option>
                      <option value="A">Linia A (Trolejbus)</option>
                      <option value="B">Linia B (Trolejbus)</option>
                      <option value="21">Linia 21 (Autobus)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Przypisany Pojazd</label>
                    <input 
                      type="text" 
                      value={reportBus} 
                      disabled
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Liczba przejechanych kilometrów (z gry/symulatora)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      placeholder="np. 45"
                      value={reportKm}
                      onChange={(e) => setReportKm(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 focus:border-emerald-500 focus:outline-none text-sm font-mono"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-slate-500 font-mono">KM</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">Status / Zdarzenia na trasie</label>
                  <select 
                    value={reportStatus} 
                    onChange={(e) => setReportStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="Bez zakłóceń">Kurs wykonany bez zakłóceń (100% premii)</option>
                    <option value="Opóźnienia">Duże opóźnienia z powodu korków w Tychach</option>
                    <option value="Kolizja">Kolizja / Awaria wozu (Wymagany screen w opisie)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 text-sm uppercase tracking-wider transition-all"
                >
                  Wyślij Raport do Weryfikacji
                </button>
              </form>
            )}
          </div>
        )}

        {/* --- TAB: PANEL ADMINA / DYSPOZYTORA --- */}
        {user.role === 'admin' && activeTab === 'admin-panel' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Statystyki zarządu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl"><Users className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Kierowcy na służbie</p>
                  <h3 className="text-2xl font-black text-white font-mono">14 / 28</h3>
                </div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl"><Bus className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Wozy w ruchu</p>
                  <h3 className="text-2xl font-black text-white font-mono">11 Autobusów, 3 Trolejbusy</h3>
                </div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Fuel className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold#">Łączny dystans firmy</p>
                  <h3 className="text-2xl font-black text-white font-mono">342,109 <span className="text-xs text-slate-500">KM</span></h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Formularz dodawania nowej służby */}
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
                <div>
                  <h3 className="font-bold text-white text-md">Wydaj nowy rozkaz wyjazdu</h3>
                  <p className="text-xs text-slate-400">Przydziel kierowcy wóz oraz linię miejską.</p>
                </div>
                <form onSubmit={handleAddRoute} className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Linia</label>
                    <select 
                      value={newLine}
                      onChange={(e) => setNewLine(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm"
                    >
                      <option value="A">Linia A (Trolejbus)</option>
                      <option value="B">Linia B (Trolejbus)</option>
                      <option value="E">Linia E (Trolejbus)</option>
                      <option value="4">Linia 4 (Autobus do Paprocan)</option>
                      <option value="75">Linia 75 (Mikołów)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Wybierz Wolnego Kierowcę</label>
                    <input 
                      type="text" 
                      required
                      placeholder="np. Kamil Glik"
                      value={newDriver}
                      onChange={(e) => setNewDriver(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 font-bold uppercase mb-1">Wóz z zajezdni</label>
                    <input 
                      type="text" 
                      required
                      placeholder="np. Solaris Urbino 12 (#105)"
                      value={newBus}
                      onChange={(e) => setNewBus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder-slate-700"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Zatwierdź i wyślij na linię
                  </button>
                </form>
              </div>

              {/* Tabela live monitoringu dyspozytorskiego */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-900/60 border-b border-slate-800">
                  <h4 className="font-bold text-sm text-white">Aktualne dyspozycje na liniach</h4>
                </div>
                <div className="divide-y divide-slate-800 font-mono text-xs">
                  {adminRoutes.map((route) => (
                    <div key={route.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:bg-slate-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center font-bold text-amber-400">{route.line}</span>
                        <div>
                          <p className="text-white font-sans font-bold text-sm">{route.driver}</p>
                          <p className="text-[11px] text-slate-500 font-sans">{route.route}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-slate-400">{route.bus}</span>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          route.status === 'W trasie' ? 'bg-blue-500/10 text-blue-400' :
                          route.status === 'Oczekuje' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>{route.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}