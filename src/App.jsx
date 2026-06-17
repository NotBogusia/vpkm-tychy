import React, { useState } from 'react';
import { 
  Bus, Clock, LogOut, Download, UploadCloud, 
  FileText, CheckCircle, MapPin, Shield, 
  Plus, Users, FileCheck, XCircle, ChevronRight, FileUp
} from 'lucide-react';

export default function App() {
  // --- STANY APLIKACJI ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminSubTab, setAdminSubTab] = useState('assign'); // assign, reports, active
  
  // Logowanie
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- DANE DLA KIEROWCY ---
  const [file, setFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  // Symulacja aktywnej służby przypisanej przez admina
  const [myShift, setMyShift] = useState({
    assigned: true,
    line: '75',
    brigade: '02',
    bus: 'Solaris U18 (#421)',
    startTime: '13:00',
    endTime: '21:00',
    pdfName: 'Rozkład_75_bryg02_Roblox.pdf'
  });

  // --- DANE DLA ADMINA ---
  // Formularz dodawania służby
  const [assignDriver, setAssignDriver] = useState('');
  const [assignLine, setAssignLine] = useState('');
  const [assignBrigade, setAssignBrigade] = useState('');
  const [assignBus, setAssignBus] = useState('');
  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assignPdf, setAssignPdf] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Lista oczekujących raportów od kierowców
  const [pendingReports, setPendingReports] = useState([
    { id: 1, driver: 'Anna Wójcik', line: 'A', date: 'Dzisiaj, 14:30', pdfName: 'Raport_Anna_Wojcik_A.pdf', status: 'pending' },
    { id: 2, driver: 'Kamil Glik', line: '4', date: 'Wczoraj, 22:15', pdfName: 'Karta_Drogowa_Kamil.pdf', status: 'pending' }
  ]);

  // --- FUNKCJE LOGIKI ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'kierowca') {
      setUser({ name: 'Mateusz Nowak', role: 'driver', avatar: 'M' });
      setIsLoggedIn(true);
      setActiveTab('dashboard');
    } else if (email === 'admin') {
      setUser({ name: 'Krzysztof Dyspozytor', role: 'admin', avatar: 'K' });
      setIsLoggedIn(true);
      setActiveTab('admin');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setUser(null); setFile(null); 
    setIsUploaded(false); setEmail(''); setPassword('');
  };

  // Obsługa plików (Kierowca)
  const handleDriverFileUpload = (e) => { if (e.target.files[0]) setFile(e.target.files[0]); };
  const submitDriverReport = () => { if (file) setIsUploaded(true); };

  // Obsługa plików (Admin)
  const handleAdminPdfUpload = (e) => { if (e.target.files[0]) setAssignPdf(e.target.files[0]); };
  
  // Wysłanie nowej służby do kierowcy
  const handleAssignShift = (e) => {
    e.preventDefault();
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setAssignDriver(''); setAssignLine(''); setAssignBrigade('');
      setAssignBus(''); setAssignStart(''); setAssignEnd(''); setAssignPdf(null);
    }, 3000);
  };

  // Zatwierdzanie/Odrzucanie raportów
  const handleReportAction = (id, action) => {
    setPendingReports(pendingReports.filter(report => report.id !== id));
  };


  // --- EKRAN LOGOWANIA ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-100">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="inline-flex p-3 bg-zinc-900 rounded-2xl mb-4 border border-zinc-800">
              <Bus className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">vPKM Tychy</h1>
            <p className="text-zinc-500 text-sm mt-1">Portal Pracowniczy</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-colors text-sm"
              placeholder="Login (kierowca / admin)"
            />
            <input 
              type="password" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-colors text-sm"
              placeholder="Hasło"
            />
            <button type="submit" className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors text-sm mt-2">
              Zaloguj się
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- EKRAN GŁÓWNY ---
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* NAGŁÓWEK APLIKACJI */}
        <header className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-medium text-emerald-400 border border-zinc-700">
              {user.avatar}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{user.role === 'admin' ? 'Centrala Dyspozytorska' : 'Kierowca Liniowy'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {user.role === 'driver' && (
              <>
                <button onClick={() => setActiveTab('dashboard')} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Bus className="h-5 w-5" /></button>
                <button onClick={() => setActiveTab('report')} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'report' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><FileText className="h-5 w-5" /></button>
              </>
            )}
            <div className="w-px h-6 bg-zinc-800 my-auto mx-1"></div>
            <button onClick={handleLogout} className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>

        {/* --- WIDOKI KIEROWCY --- */}
        <main className="flex-1 space-y-6">
          {user.role === 'driver' && activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium mb-4 text-zinc-200">Bieżąca dyspozycja</h2>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 justify-between">
                <div className="space-y-6 relative z-10 w-full">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-zinc-100 text-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-bold">
                      {myShift.line}
                    </div>
                    <div>
                      <p className="text-sm text-zinc-500">Brygada</p>
                      <h3 className="text-xl font-medium text-zinc-100">{myShift.brigade}</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Pojazd</p>
                      <p className="text-sm font-medium text-emerald-400">{myShift.bus}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Godziny</p>
                      <p className="text-sm font-medium">{myShift.startTime} - {myShift.endTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center min-w-[220px] relative z-10">
                  <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 space-y-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-zinc-400" />
                      <div>
                        <p className="text-xs text-zinc-500">Szczegóły trasy</p>
                        <p className="text-xs font-medium truncate w-32">{myShift.pdfName}</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-medium transition-colors">
                      <Download className="w-4 h-4" /> Pobierz PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {user.role === 'driver' && activeTab === 'report' && (
            <div className="animate-in fade-in duration-500">
               <h2 className="text-xl font-medium mb-4 text-zinc-200">Złożenie rozliczenia</h2>
               <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 text-center">
                {isUploaded ? (
                  <div className="space-y-4 py-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-400/10 text-emerald-400 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8" /></div>
                    <h3 className="text-xl font-medium">Raport dostarczony</h3>
                    <p className="text-sm text-zinc-500">PDF został wysłany do dyspozytorni. Dziękujemy za służbę.</p>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-6">
                    <p className="text-sm text-zinc-400">Załącz wygenerowany plik PDF z symulatora (np. logi przejazdu, screeny spalania złączone w PDF).</p>
                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-2xl p-8 transition-colors group cursor-pointer">
                      <input type="file" accept=".pdf" onChange={handleDriverFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center gap-3">
                        <UploadCloud className="w-10 h-10 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-sm font-medium text-zinc-300">{file ? file.name : "Wybierz plik PDF z dysku"}</p>
                      </div>
                    </div>
                    <button onClick={submitDriverReport} disabled={!file} className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-sm font-medium transition-colors">
                      Wyślij raport
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}


          {/* --- WIDOKI ADMINA --- */}
          {user.role === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              
              {/* Nawigacja wewnątrz panelu admina */}
              <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
                <button 
                  onClick={() => setAdminSubTab('assign')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${adminSubTab === 'assign' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Plus className="w-4 h-4" /> Wystaw Służbę
                </button>
                <button 
                  onClick={() => setAdminSubTab('reports')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${adminSubTab === 'reports' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <FileCheck className="w-4 h-4" /> Weryfikacja Raportów
                  {pendingReports.length > 0 && (
                    <span className="ml-1 bg-emerald-500 text-zinc-950 px-1.5 py-0.5 rounded-full text-[10px]">{pendingReports.length}</span>
                  )}
                </button>
              </div>

              {/* ZAKŁADKA 1: Wystawianie nowej służby */}
              {adminSubTab === 'assign' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-medium text-zinc-200">Kreator dyspozycji</h2>
                    <p className="text-sm text-zinc-500 mt-1">Uzupełnij parametry i załącz rozkład PDF, aby aktywować służbę w panelu kierowcy.</p>
                  </div>

                  {assignSuccess ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-medium text-white">Służba przypisana poprawnie!</h3>
                      <p className="text-zinc-500 text-sm mt-1">Kierowca zobaczy ją w swoim panelu.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAssignShift} className="space-y-6">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kolumna Lewa - Podstawy */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Wybierz Kierowcę</label>
                            <select required value={assignDriver} onChange={(e) => setAssignDriver(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:border-emerald-500/50 focus:outline-none">
                              <option value="">-- z listy załogi --</option>
                              <option value="Mateusz Nowak">Mateusz Nowak</option>
                              <option value="Anna Wójcik">Anna Wójcik</option>
                              <option value="Kamil Glik">Kamil Glik</option>
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Linia</label>
                              <input required type="text" placeholder="np. 75" value={assignLine} onChange={(e) => setAssignLine(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:border-emerald-500/50 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Brygada</label>
                              <input required type="text" placeholder="np. 02" value={assignBrigade} onChange={(e) => setAssignBrigade(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:border-emerald-500/50 focus:outline-none" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Przydziel Wóz</label>
                            <input required type="text" placeholder="np. Solaris Urbino 18 (#421)" value={assignBus} onChange={(e) => setAssignBus(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:border-emerald-500/50 focus:outline-none" />
                          </div>
                        </div>

                        {/* Kolumna Prawa - Czas i PDF */}
                        <div className="space-y-4 flex flex-col">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Rozpoczęcie</label>
                              <input required type="time" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 text-sm focus:border-emerald-500/50 focus:outline-none" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Zakończenie</label>
                              <input required type="time" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 text-sm focus:border-emerald-500/50 focus:outline-none" />
                            </div>
                          </div>

                          <div className="flex-1 mt-1">
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Rozkład Jazdy (PDF dla kierowcy)</label>
                            <div className="relative h-[115px] border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-xl flex items-center justify-center transition-colors group cursor-pointer">
                              <input required type="file" accept=".pdf" onChange={handleAdminPdfUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="flex flex-col items-center gap-2 text-center px-4">
                                <FileUp className="w-6 h-6 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                                <span className="text-xs font-medium text-zinc-400 truncate max-w-full">
                                  {assignPdf ? assignPdf.name : "Upuść rozkład w formacie .pdf"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-800/80">
                        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                          <Plus className="w-4 h-4" /> Wyślij dyspozycję do bazy
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ZAKŁADKA 2: Weryfikacja raportów */}
              {adminSubTab === 'reports' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-zinc-800/80 flex justify-between items-center bg-zinc-900/50">
                    <div>
                      <h2 className="text-xl font-medium text-zinc-200">Karty drogowe do weryfikacji</h2>
                      <p className="text-sm text-zinc-500 mt-1">Sprawdź przesłane pliki PDF i rozlicz kierowców.</p>
                    </div>
                  </div>

                  {pendingReports.length === 0 ? (
                    <div className="p-10 text-center text-zinc-500 text-sm">
                      Brak nowych raportów. Wszyscy rozliczeni!
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-800/60">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-zinc-800/20 transition-colors">
                          
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 text-zinc-100 rounded-xl flex items-center justify-center font-bold text-lg">
                              {report.line}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-200 text-base">{report.driver}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Zakończono: {report.date}</p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            {/* Przycisk pobierania PDF */}
                            <button className="w-full sm:w-auto flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-sm font-medium text-zinc-300 transition-colors">
                              <FileText className="w-4 h-4 text-emerald-400" />
                              <span className="truncate max-w-[150px]">{report.pdfName}</span>
                              <Download className="w-4 h-4 ml-2 opacity-50" />
                            </button>

                            {/* Akcje - Akceptuj / Odrzuć */}
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button 
                                onClick={() => handleReportAction(report.id, 'approve')}
                                className="flex-1 sm:flex-none p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center"
                                title="Zatwierdź"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleReportAction(report.id, 'reject')}
                                className="flex-1 sm:flex-none p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors border border-red-500/20 flex items-center justify-center"
                                title="Odrzuć do poprawy"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </div>
  );
}