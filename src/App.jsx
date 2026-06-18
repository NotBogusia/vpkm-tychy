import React, { useState, useEffect } from 'react';

import { 
  Bus, LogOut, Download, UploadCloud, 
  FileText, CheckCircle, Plus, FileCheck, XCircle, FileUp, Users, UserPlus, ShieldAlert,
  Pencil, Truck, UserX, Save, X
} from 'lucide-react';

const API_URL = 'https://vpkm-backend-production.up.railway.app';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('vpkm_token');
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminSubTab, setAdminSubTab] = useState('assign');
  const [loginError, setLoginError] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [myShift, setMyShift] = useState(null);
  const [driverReportFile, setDriverReportFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignLine, setAssignLine] = useState('');
  const [assignBrigade, setAssignBrigade] = useState('');
  const [assignBus, setAssignBus] = useState('');
  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assignPdf, setAssignPdf] = useState(null);
  const [assignSuccess, setAssignSuccess] = useState(false);
  
  const [pendingReports, setPendingReports] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  
  const [newDriverLogin, setNewDriverLogin] = useState('');
  const [newDriverPass, setNewDriverPass] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverSuccess, setNewDriverSuccess] = useState(false);

  // --- TABOR ---
  const [fleet, setFleet] = useState([]);
  const [fleetEditId, setFleetEditId] = useState(null);
  const [fleetEditBusNumber, setFleetEditBusNumber] = useState('');
  const [fleetEditModel, setFleetEditModel] = useState('');
  const [fleetEditDriverId, setFleetEditDriverId] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newBusModel, setNewBusModel] = useState('');
  const [newBusDriverId, setNewBusDriverId] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    if (user.role === 'driver') {
      authFetch(`${API_URL}/api/shifts/${user.id}`)
        .then(res => res.json())
        .then(data => setMyShift(data.shift || null))
        .catch(err => console.error(err));
    }

    if (user.role === 'admin') {
      fetchDrivers();
      fetchActiveShifts();
      if (adminSubTab === 'reports') fetchReports();
      if (adminSubTab === 'fleet') fetchFleet();
    }

    if (user.role === 'driver' && activeTab === 'fleet') {
      fetchFleet();
      fetchDrivers();
    }
  }, [isLoggedIn, user, adminSubTab, activeTab]);

  const fetchReports = () => {
    authFetch(`${API_URL}/api/reports/pending`)
      .then(res => res.json())
      .then(data => setPendingReports(data.reports))
      .catch(err => console.error(err));
  };

  const fetchDrivers = () => {
    authFetch(`${API_URL}/api/drivers`)
      .then(res => res.json())
      .then(data => setDriversList(data))
      .catch(err => console.error(err));
  };

  const fetchActiveShifts = () => {
    authFetch(`${API_URL}/api/shifts`)
      .then(res => res.json())
      .then(data => setActiveShifts(data.shifts || []))
      .catch(err => console.error(err));
  };

  const fetchFleet = () => {
    authFetch(`${API_URL}/api/fleet`)
      .then(res => res.json())
      .then(data => setFleet(data))
      .catch(err => console.error(err));
  };

  const handleCancelShift = async (driverId) => {
    if (!confirm('Anulować tę służbę?')) return;
    try {
      await authFetch(`${API_URL}/api/shifts/${driverId}`, { method: 'DELETE' });
      fetchActiveShifts();
    } catch (err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: email, password: password })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('vpkm_token', data.token);
        setUser({
          id: data.user.id,
          name: data.user.displayName,
          role: data.user.role,
          avatar: data.user.displayName.charAt(0).toUpperCase()
        });
        setIsLoggedIn(true);
        setActiveTab(data.user.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        setLoginError(data.message);
      }
    } catch (error) {
      setLoginError("Błąd łączenia z serwerem. Upewnij się, że backend działa.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vpkm_token');
    setIsLoggedIn(false); setUser(null); setDriverReportFile(null); 
    setIsUploaded(false); setEmail(''); setPassword(''); setMyShift(null);
  };

  const submitDriverReport = async () => {
    if (!driverReportFile || !myShift) return;

    const formData = new FormData();
    formData.append('report_pdf', driverReportFile);
    formData.append('driverId', user.id);
    formData.append('driverName', user.name);
    formData.append('line', myShift.line);

    try {
      const res = await authFetch(`${API_URL}/api/reports`, { method: 'POST', body: formData });
      if (res.ok) setIsUploaded(true);
    } catch (err) { console.error(err); }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_URL}/api/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          login: newDriverLogin, 
          password: newDriverPass, 
          displayName: newDriverName 
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewDriverSuccess(true);
        setNewDriverLogin(''); setNewDriverPass(''); setNewDriverName('');
        fetchDrivers();
        setTimeout(() => setNewDriverSuccess(false), 3000);
      } else {
        alert(data.message);
      }
    } catch (error) { console.error(error); }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    if (!assignPdf || !assignDriverId) { alert("Wybierz kierowcę i załącz PDF!"); return; }

    const selectedDriver = driversList.find(d => d.id === assignDriverId);

    const formData = new FormData();
    formData.append('pdf_file', assignPdf);
    formData.append('driverId', selectedDriver.id);
    formData.append('driverName', selectedDriver.displayName);
    formData.append('line', assignLine);
    formData.append('brigade', assignBrigade);
    formData.append('bus', assignBus);
    formData.append('startTime', assignStart);
    formData.append('endTime', assignEnd);

    try {
      const response = await authFetch(`${API_URL}/api/shifts`, { method: 'POST', body: formData });
      if (response.ok) {
        setAssignSuccess(true);
        fetchActiveShifts();
        setTimeout(() => {
          setAssignSuccess(false);
          setAssignDriverId(''); setAssignLine(''); setAssignBrigade('');
          setAssignBus(''); setAssignStart(''); setAssignEnd(''); setAssignPdf(null);
        }, 3000);
      }
    } catch (err) { console.error(err); }
  };

  const handleReportAction = async (id, action) => {
    try {
      const response = await authFetch(`${API_URL}/api/reports/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (response.ok) fetchReports();
    } catch (err) { console.error(err); }
  };

  // --- TABOR: DODAWANIE ---
  const handleAddVehicle = async (e) => {
    e.preventDefault();
    const selectedDriver = driversList.find(d => d.id === newBusDriverId);
    try {
      const res = await authFetch(`${API_URL}/api/fleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busNumber: newBusNumber,
          model: newBusModel,
          assignedDriverId: newBusDriverId || '',
          assignedDriverName: selectedDriver ? selectedDriver.displayName : 'Brak'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewBusNumber(''); setNewBusModel(''); setNewBusDriverId('');
        setShowAddVehicle(false);
        fetchFleet();
      }
    } catch (err) { console.error(err); }
  };

  // --- TABOR: START EDYCJI ---
  const startEditVehicle = (vehicle) => {
    setFleetEditId(vehicle.id);
    setFleetEditBusNumber(vehicle.busNumber);
    setFleetEditModel(vehicle.model);
    setFleetEditDriverId(vehicle.assignedDriverId || '');
  };

  // --- TABOR: ZAPIS EDYCJI ---
  const handleSaveVehicle = async (id) => {
    const selectedDriver = driversList.find(d => d.id === fleetEditDriverId);
    try {
      const res = await authFetch(`${API_URL}/api/fleet/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busNumber: fleetEditBusNumber,
          model: fleetEditModel,
          assignedDriverId: fleetEditDriverId || '',
          assignedDriverName: selectedDriver ? selectedDriver.displayName : 'Brak'
        })
      });
      if (res.ok) {
        setFleetEditId(null);
        fetchFleet();
      }
    } catch (err) { console.error(err); }
  };

  // --- TABOR: ANULOWANIE PRZYPISANIA KIEROWCY ---
  const handleUnassignDriver = async (vehicle) => {
    if (!confirm(`Anulować przypisanie kierowcy do wozu #${vehicle.busNumber}?`)) return;
    try {
      await authFetch(`${API_URL}/api/fleet/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busNumber: vehicle.busNumber,
          model: vehicle.model,
          assignedDriverId: '',
          assignedDriverName: 'Brak'
        })
      });
      fetchFleet();
    } catch (err) { console.error(err); }
  };

  // --- TABOR: USUWANIE ---
  const handleDeleteVehicle = async (id) => {
    if (!confirm('Usunąć pojazd z taboru?')) return;
    try {
      await authFetch(`${API_URL}/api/fleet/${id}`, { method: 'DELETE' });
      fetchFleet();
    } catch (err) { console.error(err); }
  };

  // --- WIDOK TABORU (WSPÓLNY DLA KIEROWCY I ADMINA) ---
  const FleetView = ({ isAdmin }) => (
    <div className="animate-in fade-in duration-500 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-zinc-200">Tabor</h2>
        {isAdmin && (
          <button
            onClick={() => setShowAddVehicle(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Dodaj pojazd
          </button>
        )}
      </div>

      {/* Formularz dodawania pojazdu */}
      {isAdmin && showAddVehicle && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" /> Nowy pojazd
          </h3>
          <form onSubmit={handleAddVehicle} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nr taborowy</label>
              <input
                required type="text" placeholder="np. 421"
                value={newBusNumber} onChange={(e) => setNewBusNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Model</label>
              <input
                required type="text" placeholder="np. Solaris Urbino 18"
                value={newBusModel} onChange={(e) => setNewBusModel(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1.5">Przypisany kierowca</label>
              <select
                value={newBusDriverId} onChange={(e) => setNewBusDriverId(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50"
              >
                <option value="">-- Brak --</option>
                {driversList.map(d => (
                  <option key={d.id} value={d.id}>{d.displayName}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors">
                Dodaj
              </button>
              <button type="button" onClick={() => setShowAddVehicle(false)} className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista pojazdów */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        {fleet.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">
            Brak pojazdów w taborze.{isAdmin && ' Dodaj pierwszy wóz przyciskiem powyżej.'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {/* Nagłówek tabeli */}
            <div className="hidden md:grid md:grid-cols-12 px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
              <div className="col-span-2">Nr tab.</div>
              <div className="col-span-4">Model</div>
              <div className="col-span-4">Przypisany kierowca</div>
              {isAdmin && <div className="col-span-2 text-right">Akcje</div>}
            </div>

            {fleet.map((vehicle) => (
              <div key={vehicle.id} className="px-6 py-4 hover:bg-zinc-800/20 transition-colors">
                {fleetEditId === vehicle.id ? (
                  /* Tryb edycji */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-2">
                      <input
                        type="text" value={fleetEditBusNumber}
                        onChange={(e) => setFleetEditBusNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-emerald-500/40 rounded-xl text-zinc-200 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <input
                        type="text" value={fleetEditModel}
                        onChange={(e) => setFleetEditModel(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-emerald-500/40 rounded-xl text-zinc-200 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <select
                        value={fleetEditDriverId}
                        onChange={(e) => setFleetEditDriverId(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-950 border border-emerald-500/40 rounded-xl text-zinc-200 text-sm focus:outline-none"
                      >
                        <option value="">-- Brak --</option>
                        {driversList.map(d => (
                          <option key={d.id} value={d.id}>{d.displayName}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex gap-2 justify-end">
                      <button
                        onClick={() => handleSaveVehicle(vehicle.id)}
                        className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setFleetEditId(null)}
                        className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tryb widoku */
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5 md:col-span-2">
                      <span className="inline-flex items-center justify-center w-12 h-10 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-bold text-sm">
                        {vehicle.busNumber}
                      </span>
                    </div>
                    <div className="col-span-7 md:col-span-4">
                      <p className="text-sm font-medium text-zinc-200">{vehicle.model}</p>
                    </div>
                    <div className="col-span-9 md:col-span-4 flex items-center gap-2">
                      {vehicle.assignedDriverId ? (
                        <>
                          <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-medium text-emerald-400 border border-zinc-700">
                            {vehicle.assignedDriverName.charAt(0)}
                          </div>
                          <span className="text-sm text-zinc-300">{vehicle.assignedDriverName}</span>
                        </>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Nieprzypisany</span>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="col-span-3 md:col-span-2 flex gap-2 justify-end">
                        <button
                          onClick={() => startEditVehicle(vehicle)}
                          className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                          title="Edytuj"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {vehicle.assignedDriverId && (
                          <button
                            onClick={() => handleUnassignDriver(vehicle)}
                            className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                            title="Anuluj przypisanie kierowcy"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                          title="Usuń pojazd"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- EKRAN LOGOWANIA ---
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-100 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('/bg-login.jpg')` }}
        />
        <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-xl" />

        <div className="relative z-10 w-full max-w-md bg-zinc-900/60 p-8 sm:p-10 rounded-3xl border border-zinc-800/80 backdrop-blur-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-zinc-950/60 rounded-2xl mb-4 border border-zinc-800/50">
              <Bus className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">vPKM Tychy</h1>
            <p className="text-zinc-400 text-sm mt-1">Portal Pracowniczy</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {loginError}
              </div>
            )}
            <input 
              type="text" value={email} onChange={(e) => setEmail(e.target.value)} required 
              className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:bg-zinc-950/80 transition-colors text-sm" 
              placeholder="Login z gry" 
            />
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:bg-zinc-950/80 transition-colors text-sm" 
              placeholder="Hasło dyspozytorskie" 
            />
            <button 
              type="submit" 
              className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors text-sm mt-2 shadow-lg"
            >
              Zaloguj się
            </button>
          </form>
          
          <p className="text-[10px] text-center text-zinc-500 mt-6">Domyślny admin - Login: <b className="text-zinc-400">admin</b> | Hasło: <b className="text-zinc-400">123</b></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        <header className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-medium text-emerald-400 border border-zinc-700">{user.avatar}</div>
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
                <button onClick={() => { setActiveTab('fleet'); fetchFleet(); fetchDrivers(); }} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'fleet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Truck className="h-5 w-5" /></button>
              </>
            )}
            <div className="w-px h-6 bg-zinc-800 my-auto mx-1"></div>
            <button onClick={handleLogout} className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="flex-1 space-y-6">
          {user.role === 'driver' && activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <h2 className="text-xl font-medium mb-4 text-zinc-200">Bieżąca dyspozycja</h2>
              {myShift ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 justify-between">
                  <div className="space-y-6 w-full">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-zinc-100 text-zinc-950 rounded-2xl flex items-center justify-center text-2xl font-bold">{myShift.line}</div>
                      <div><p className="text-sm text-zinc-500">Brygada</p><h3 className="text-xl font-medium text-zinc-100">{myShift.brigade}</h3></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800/50">
                      <div><p className="text-xs text-zinc-500 mb-1">Pojazd</p><p className="text-sm font-medium text-emerald-400">{myShift.bus}</p></div>
                      <div><p className="text-xs text-zinc-500 mb-1">Godziny</p><p className="text-sm font-medium">{myShift.startTime} - {myShift.endTime}</p></div>
                    </div>
                  </div>
                  {myShift.pdfUrl && (
                    <div className="flex flex-col justify-center min-w-[220px]">
                      <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 space-y-4">
                        <div className="flex items-center gap-3"><FileText className="w-8 h-8 text-zinc-400" /><div><p className="text-xs text-zinc-500">Rozkład jazdy</p><p className="text-xs font-medium text-zinc-400">Pobierz załącznik</p></div></div>
                        <a href={`${API_URL}${myShift.pdfUrl}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-medium transition-colors"><Download className="w-4 h-4" /> Otwórz PDF</a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500 text-sm">Wolne! Dyspozytor nie przypisał Ci jeszcze żadnej służby na dzisiaj.</div>
              )}
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
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-6">
                    <p className="text-sm text-zinc-400">Wyślij plik PDF z podsumowaniem służby.</p>
                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-2xl p-8 group cursor-pointer">
                      <input type="file" accept=".pdf" onChange={(e) => setDriverReportFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center gap-3">
                        <UploadCloud className="w-10 h-10 text-zinc-600 group-hover:text-emerald-400" />
                        <p className="text-sm font-medium text-zinc-300">{driverReportFile ? driverReportFile.name : "Wybierz plik PDF"}</p>
                      </div>
                    </div>
                    <button onClick={submitDriverReport} disabled={!driverReportFile || !myShift} className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-sm font-medium">Wyślij raport</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === 'driver' && activeTab === 'fleet' && (
            <FleetView isAdmin={false} />
          )}

          {user.role === 'admin' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit overflow-x-auto">
                <button onClick={() => setAdminSubTab('assign')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'assign' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Plus className="w-4 h-4" /> Wystaw Służbę</button>
                <button onClick={() => setAdminSubTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'reports' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><FileCheck className="w-4 h-4" /> Raporty</button>
                <button onClick={() => setAdminSubTab('crew')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'crew' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Users className="w-4 h-4" /> Załoga</button>
                <button onClick={() => { setAdminSubTab('fleet'); fetchFleet(); fetchDrivers(); }} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'fleet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Truck className="w-4 h-4" /> Tabor</button>
              </div>

              {adminSubTab === 'crew' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 h-fit">
                    <h2 className="text-xl font-medium text-zinc-200 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-emerald-400" /> Dodaj kierowcę</h2>
                    {newDriverSuccess ? (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm text-center">Konto zostało pomyślnie utworzone!</div>
                    ) : (
                      <form onSubmit={handleAddDriver} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nick / Imię w grze</label>
                          <input required type="text" placeholder="np. Kacper Nowak" value={newDriverName} onChange={(e) => setNewDriverName(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Login do panelu</label>
                          <input required type="text" placeholder="np. kacper" value={newDriverLogin} onChange={(e) => setNewDriverLogin(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1.5">Hasło</label>
                          <input required type="text" placeholder="np. vPKM123" value={newDriverPass} onChange={(e) => setNewDriverPass(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" />
                        </div>
                        <button type="submit" className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm mt-2">Stwórz konto</button>
                      </form>
                    )}
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
                    <h2 className="text-xl font-medium text-zinc-200 mb-4">Zatrudnieni</h2>
                    <div className="space-y-2">
                      {driversList.length === 0 ? (
                        <p className="text-sm text-zinc-500">Brak zarejestrowanych kierowców. Stwórz pierwsze konto.</p>
                      ) : (
                        driversList.map(d => (
                          <div key={d.id} className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl">
                            <div>
                              <p className="font-medium text-sm text-zinc-200">{d.displayName}</p>
                              <p className="text-xs text-zinc-500">ID: {d.login}</p>
                            </div>
                            <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md text-xs font-medium">Kierowca</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {adminSubTab === 'assign' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
                  <h2 className="text-xl font-medium text-zinc-200 mb-6">Kreator dyspozycji</h2>
                  {assignSuccess ? (
                    <div className="py-12 flex flex-col items-center text-center"><div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8" /></div><h3 className="text-lg font-medium text-white">Służba przypisana poprawnie!</h3></div>
                  ) : (
                    <form onSubmit={handleAssignShift} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Wybierz Kierowcę (Z bazy załogi)</label>
                            <select required value={assignDriverId} onChange={(e) => setAssignDriverId(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50">
                              <option value="">-- Kto dzisiaj jeździ? --</option>
                              {driversList.map(d => (
                                <option key={d.id} value={d.id}>{d.displayName} ({d.login})</option>
                              ))}
                            </select>
                            {driversList.length === 0 && <p className="text-[10px] text-red-400 mt-1">Najpierw musisz dodać kierowcę w zakładce "Załoga".</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Linia</label><input required type="text" placeholder="75" value={assignLine} onChange={(e) => setAssignLine(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none" /></div>
                            <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Brygada</label><input required type="text" placeholder="02" value={assignBrigade} onChange={(e) => setAssignBrigade(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none" /></div>
                          </div>
                          <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Przydziel Wóz</label><input required type="text" placeholder="Solaris U18 (#421)" value={assignBus} onChange={(e) => setAssignBus(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none" /></div>
                        </div>

                        <div className="space-y-4 flex flex-col">
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Rozpoczęcie</label><input required type="time" value={assignStart} onChange={(e) => setAssignStart(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 text-sm focus:outline-none" /></div>
                            <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Zakończenie</label><input required type="time" value={assignEnd} onChange={(e) => setAssignEnd(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 text-sm focus:outline-none" /></div>
                          </div>
                          <div className="flex-1 mt-1">
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Rozkład Jazdy (PDF)</label>
                            <div className="relative h-[115px] border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-xl flex items-center justify-center group cursor-pointer">
                              <input required type="file" accept=".pdf" onChange={(e) => setAssignPdf(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="flex flex-col items-center gap-2 text-center px-4"><FileUp className="w-6 h-6 text-zinc-600 group-hover:text-emerald-400" /><span className="text-xs font-medium text-zinc-400 truncate max-w-full">{assignPdf ? assignPdf.name : "Wgraj rozkład .pdf"}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-zinc-800/80"><button type="submit" disabled={driversList.length === 0} className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm flex items-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-600"><Plus className="w-4 h-4" /> Wyślij dyspozycję</button></div>
                    </form>
                  )}

                  <div className="mt-8 border-t border-zinc-800 pt-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Aktywne służby</h3>
                    {activeShifts.length === 0 ? (
                      <p className="text-xs text-zinc-600">Brak aktywnych służb.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeShifts.map(s => (
                          <div key={s.id} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-zinc-200">{s.driverName}</p>
                              <p className="text-xs text-zinc-500">Linia {s.line} | Brygada {s.brigade} | {s.startTime}–{s.endTime}</p>
                            </div>
                            <button onClick={() => handleCancelShift(s.driverId)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {adminSubTab === 'reports' && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-zinc-800/80"><h2 className="text-xl font-medium text-zinc-200">Karty drogowe do weryfikacji</h2></div>
                  {pendingReports.length === 0 ? (
                    <div className="p-10 text-center text-zinc-500 text-sm">Wszystkie raporty zostały sprawdzone.</div>
                  ) : (
                    <div className="divide-y divide-zinc-800/60">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-zinc-800/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 text-zinc-100 rounded-xl flex items-center justify-center font-bold text-lg">{report.line}</div>
                            <div><p className="font-medium text-zinc-200">{report.driverName}</p><p className="text-xs text-zinc-500">Wysłano: {report.date}</p></div>
                          </div>
                          <div className="flex items-center gap-3 w-full lg:w-auto">
                            <a href={`${API_URL}${report.pdfUrl}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300"><FileText className="w-4 h-4 text-emerald-400" /> Pobierz Raport PDF</a>
                            <div className="flex gap-2">
                              <button onClick={() => handleReportAction(report.id, 'approve')} className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><CheckCircle className="w-5 h-5" /></button>
                              <button onClick={() => handleReportAction(report.id, 'reject')} className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"><XCircle className="w-5 h-5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {adminSubTab === 'fleet' && (
                <FleetView isAdmin={true} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}