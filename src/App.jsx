import React, { useState } from 'react';
import { 
  Bus, Clock, LogOut, Download, UploadCloud, 
  FileText, CheckCircle, MapPin, User, Shield 
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Logowanie
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Raport (Upload)
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'kierowca') {
      setUser({ name: 'Mateusz Nowak', role: 'driver', avatar: 'M' });
      setIsLoggedIn(true);
    } else if (email === 'admin') {
      setUser({ name: 'Krzysztof Dyspozytor', role: 'admin', avatar: 'K' });
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setFile(null);
    setIsUploaded(false);
    setEmail('');
    setPassword('');
  };

  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const submitReport = () => {
    if (file) setIsUploaded(true);
  };

  // --- WIDOK LOGOWANIA (Minimalistyczny) ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-100">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-zinc-900 rounded-2xl mb-4 shadow-sm border border-zinc-800">
              <Bus className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">vPKM Tychy</h1>
            <p className="text-zinc-500 text-sm mt-1">Zaloguj się do panelu kierowcy</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-colors text-sm"
              placeholder="Login (wpisz: kierowca lub admin)"
            />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-colors text-sm"
              placeholder="Hasło (wpisz cokolwiek)"
            />
            <button 
              type="submit" 
              className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors text-sm mt-2"
            >
              Zaloguj się
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- WIDOK GŁÓWNY (Comfy) ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Górny pasek */}
        <header className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-medium text-emerald-400 border border-zinc-700">
              {user.avatar}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{user.role === 'admin' ? 'Dyspozytor' : 'Kierowca'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {user.role === 'driver' && (
              <>
                <button onClick={() => setActiveTab('dashboard')} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Bus className="h-5 w-5" /></button>
                <button onClick={() => setActiveTab('report')} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'report' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><FileText className="h-5 w-5" /></button>
              </>
            )}
            {user.role === 'admin' && (
              <button onClick={() => setActiveTab('dashboard')} className="p-2.5 rounded-xl bg-zinc-800 text-zinc-100"><Shield className="h-5 w-5" /></button>
            )}
            <div className="w-px h-6 bg-zinc-800 my-auto mx-1"></div>
            <button onClick={handleLogout} className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>

        {/* ZAWARTOŚĆ */}
        <main className="flex-1 space-y-6">

          {/* KIEROWCA - PANEL */}
          {user.role === 'driver' && activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
              <h2 className="text-xl font-medium mb-4 text-zinc-200">Twoja służba na dziś</h2>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                {/* Delikatne tło */}
                <div className="absolute -right-10 -top-10 opacity-5 pointer-events-none">
                  <Bus className="w-64 h-64 text-zinc-100" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between">
                  {/* Podstawowe info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-zinc-100 text-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-bold">
                        75
                      </div>
                      <div>
                        <p className="text-sm text-zinc-500">Kierunek</p>
                        <h3 className="text-xl font-medium text-zinc-100">Mikołów Dworzec PKP</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Brygada</p>
                        <p className="text-sm font-medium">02</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Wóz</p>
                        <p className="text-sm font-medium text-emerald-400">Solaris U18 (#421)</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Początek</p>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Clock className="w-4 h-4 text-zinc-500" /> 13:00
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Koniec</p>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Clock className="w-4 h-4 text-zinc-500" /> 21:00
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sekcja PDF */}
                  <div className="flex flex-col justify-end min-w-[200px]">
                    <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 space-y-3">
                      <p className="text-xs text-zinc-400 text-center">Szczegółowa rozpiska przystanków i przerw</p>
                      <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-medium transition-colors">
                        <Download className="w-4 h-4" />
                        Pobierz PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KIEROWCA - RAPORT */}
          {user.role === 'driver' && activeTab === 'report' && (
            <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
              <h2 className="text-xl font-medium mb-4 text-zinc-200">Złożenie raportu</h2>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 text-center">
                {isUploaded ? (
                  <div className="space-y-4 py-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-medium">Raport wysłany</h3>
                    <p className="text-sm text-zinc-500">Dzięki za służbę! Plik został przekazany do dyspozytorni.</p>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-6">
                    <p className="text-sm text-zinc-400">
                      Zakończyłeś służbę? Załącz wygenerowany plik PDF z podsumowaniem przejazdu.
                    </p>
                    
                    {/* Własny wygląd pola na plik */}
                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-2xl p-8 transition-colors group cursor-pointer">
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <UploadCloud className="w-10 h-10 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-sm font-medium text-zinc-300">
                          {file ? file.name : "Kliknij lub przeciągnij plik PDF"}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={submitReport}
                      disabled={!file}
                      className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-sm font-medium transition-colors"
                    >
                      Wyślij rozliczenie
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADMIN - DASHBOARD */}
          {user.role === 'admin' && (
            <div className="animate-in fade-in duration-500 slide-in-from-bottom-2">
               <h2 className="text-xl font-medium mb-4 text-zinc-200">Przegląd służb</h2>
               
               <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                  <div className="divide-y divide-zinc-800/60">
                    
                    {/* Element listy 1 */}
                    <div className="p-5 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 text-zinc-100 rounded-lg flex items-center justify-center font-bold">75</div>
                        <div>
                          <p className="font-medium text-zinc-200">Mateusz Nowak</p>
                          <p className="text-xs text-zinc-500">Brygada 02 • Solaris U18</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md">W trakcie</span>
                        <p className="text-xs text-zinc-600 mt-1">13:00 - 21:00</p>
                      </div>
                    </div>

                    {/* Element listy 2 */}
                    <div className="p-5 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 text-zinc-100 rounded-lg flex items-center justify-center font-bold">A</div>
                        <div>
                          <p className="font-medium text-zinc-200">Anna Wójcik</p>
                          <p className="text-xs text-zinc-500">Brygada 01 • Trollino 12</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        {/* Ikona oznaczająca załączony plik (raport) */}
                        <div className="text-emerald-400 flex items-center gap-1 text-xs bg-emerald-400/10 px-2 py-1 rounded">
                          <FileText className="w-3 h-3" /> Raport PDF
                        </div>
                        <div>
                          <span className="inline-block px-2.5 py-1 bg-zinc-800 text-zinc-500 text-xs rounded-md">Zakończono</span>
                        </div>
                      </div>
                    </div>

                  </div>
               </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}