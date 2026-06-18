import React, { useState, useEffect } from 'react';

import { 
  Bus, LogOut, Download, UploadCloud, 
  FileText, CheckCircle, Plus, FileCheck, XCircle, FileUp, Users, UserPlus, ShieldAlert,
  Pencil, Truck, UserX, Save, X, KeyRound, ChevronDown, ChevronUp
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

const downloadProtectedFile = async (url) => {
  try {
    const res = await authFetch(url);
    if (!res.ok) {
      alert('Nie udało się pobrać pliku. Sprawdź, czy masz do niego dostęp.');
      return;
    }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) {
    console.error(err);
    alert('Błąd podczas pobierania pliku.');
  }
};

// ---------------------------------------------------------
// Stałe — listy wyboru
// ---------------------------------------------------------
const VEHICLE_TYPES = [
  'Autobus standardowy',
  'Autobus przegubowy',
  'Autobus midi',
  'Autobus mini',
  'Trolejbus',
  'Tramwaj',
];

const FLEET_TYPES = [
  'miejski',
  'podmiejski',
  'regionalny',
  'szkolny',
  'turystyczny',
];

const VEHICLE_STATUSES = [
  { value: 'sprawny',       label: 'Sprawny',         color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { value: 'w_naprawie',    label: 'W naprawie',       color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'wycofany',      label: 'Wycofany',         color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 'rezerwowy',     label: 'Rezerwowy',        color: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
];

const statusBadge = (value) => {
  const s = VEHICLE_STATUSES.find(x => x.value === value) || VEHICLE_STATUSES[0];
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${s.color}`}>
      {s.label}
    </span>
  );
};

// ---------------------------------------------------------
// Pusty obiekt pojazdu — używany przy inicjalizacji formularzy
// ---------------------------------------------------------
const emptyVehicle = {
  busNumber: '',
  brand: '',
  model: '',
  vehicleType: '',
  fleetType: '',
  status: 'sprawny',
  yearManufactured: '',
  registrationNumber: '',
  assignedDriverId: '',
  notes: '',
};

// ---------------------------------------------------------
// FleetForm — współdzielony formularz dodawania / edycji
// ---------------------------------------------------------
const FleetForm = ({ values, onChange, driversList, onSubmit, onCancel, submitLabel }) => {
  const field = (name) => ({
    value: values[name],
    onChange: (e) => onChange(name, e.target.value),
  });

  const inputCls = "w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50";
  const labelCls = "block text-xs font-medium text-zinc-500 mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Wiersz 1 — identyfikacja */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Nr taborowy *</label>
          <input required type="text" placeholder="np. 421" {...field('busNumber')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Nr rejestracyjny</label>
          <input type="text" placeholder="np. SY 12345" {...field('registrationNumber')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Rok produkcji</label>
          <input type="text" placeholder="np. 2019" maxLength={4} {...field('yearManufactured')} className={inputCls} />
        </div>
      </div>

      {/* Wiersz 2 — marka i model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Marka *</label>
          <input required type="text" placeholder="np. Solaris" {...field('brand')} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Typ / Model *</label>
          <input required type="text" placeholder="np. Urbino 18" {...field('model')} className={inputCls} />
        </div>
      </div>

      {/* Wiersz 3 — klasyfikacja */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Rodzaj pojazdu</label>
          <select {...field('vehicleType')} className={inputCls}>
            <option value="">-- wybierz --</option>
            {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Typ taboru</label>
          <select {...field('fleetType')} className={inputCls}>
            <option value="">-- wybierz --</option>
            {FLEET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Stan</label>
          <select {...field('status')} className={inputCls}>
            {VEHICLE_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Wiersz 4 — kierowca + uwagi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Przypisany kierowca</label>
          <select {...field('assignedDriverId')} className={inputCls}>
            <option value="">-- Brak --</option>
            {driversList.map(d => (
              <option key={d.id} value={d.id}>{d.displayName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Uwagi</label>
          <input type="text" placeholder="np. tylko trasy płaskie" {...field('notes')} className={inputCls} />
        </div>
      </div>

      {/* Przyciski */}
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors">
          <Save className="w-4 h-4" /> {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

// ---------------------------------------------------------
// FleetView — wyniesiony poza App żeby nie tracić fokusa
// ---------------------------------------------------------
const FleetView = ({
  isAdmin,
  fleet,
  driversList,
  onRefresh,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addValues, setAddValues] = useState(emptyVehicle);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState(emptyVehicle);
  const [expandedId, setExpandedId] = useState(null);

  const handleAddChange = (name, value) => setAddValues(v => ({ ...v, [name]: value }));
  const handleEditChange = (name, value) => setEditValues(v => ({ ...v, [name]: value }));

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const selectedDriver = driversList.find(d => d.id === addValues.assignedDriverId);
    try {
      const res = await authFetch(`${API_URL}/api/fleet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addValues,
          assignedDriverName: selectedDriver ? selectedDriver.displayName : 'Brak',
        })
      });
      const data = await res.json();
      if (data.success) {
        setAddValues(emptyVehicle);
        setShowAdd(false);
        onRefresh();
      }
    } catch (err) { console.error(err); }
  };

  const startEdit = (vehicle) => {
    setEditId(vehicle.id);
    setEditValues({
      busNumber: vehicle.busNumber,
      brand: vehicle.brand || '',
      model: vehicle.model,
      vehicleType: vehicle.vehicleType || '',
      fleetType: vehicle.fleetType || '',
      status: vehicle.status || 'sprawny',
      yearManufactured: vehicle.yearManufactured || '',
      registrationNumber: vehicle.registrationNumber || '',
      assignedDriverId: vehicle.assignedDriverId || '',
      notes: vehicle.notes || '',
    });
    setExpandedId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const selectedDriver = driversList.find(d => d.id === editValues.assignedDriverId);
    try {
      const res = await authFetch(`${API_URL}/api/fleet/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editValues,
          assignedDriverName: selectedDriver ? selectedDriver.displayName : 'Brak',
        })
      });
      if (res.ok) {
        setEditId(null);
        onRefresh();
      }
    } catch (err) { console.error(err); }
  };

  const handleUnassign = async (vehicle) => {
    if (!confirm(`Anulować przypisanie kierowcy do wozu #${vehicle.busNumber}?`)) return;
    try {
      await authFetch(`${API_URL}/api/fleet/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          busNumber: vehicle.busNumber,
          brand: vehicle.brand,
          model: vehicle.model,
          vehicleType: vehicle.vehicleType,
          fleetType: vehicle.fleetType,
          status: vehicle.status,
          yearManufactured: vehicle.yearManufactured,
          registrationNumber: vehicle.registrationNumber,
          assignedDriverId: '',
          assignedDriverName: 'Brak',
          notes: vehicle.notes,
        })
      });
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Usunąć pojazd z taboru?')) return;
    try {
      await authFetch(`${API_URL}/api/fleet/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-zinc-200">Tabor</h2>
        {isAdmin && (
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Dodaj pojazd
          </button>
        )}
      </div>

      {/* Formularz dodawania */}
      {isAdmin && showAdd && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-5 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" /> Nowy pojazd
          </h3>
          <FleetForm
            values={addValues}
            onChange={handleAddChange}
            driversList={driversList}
            onSubmit={handleAddSubmit}
            onCancel={() => setShowAdd(false)}
            submitLabel="Dodaj pojazd"
          />
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
              <div className="col-span-1">Nr tab.</div>
              <div className="col-span-3">Marka / Model</div>
              <div className="col-span-2">Rodzaj</div>
              <div className="col-span-2">Stan</div>
              <div className="col-span-2">Kierowca</div>
              {isAdmin && <div className="col-span-2 text-right">Akcje</div>}
            </div>

            {fleet.map((vehicle) => (
              <div key={vehicle.id}>
                {/* Tryb edycji */}
                {editId === vehicle.id ? (
                  <div className="px-6 py-5">
                    <p className="text-xs text-zinc-500 mb-4 flex items-center gap-2">
                      <Pencil className="w-3 h-3" /> Edycja: wóz #{vehicle.busNumber}
                    </p>
                    <FleetForm
                      values={editValues}
                      onChange={handleEditChange}
                      driversList={driversList}
                      onSubmit={handleEditSubmit}
                      onCancel={() => setEditId(null)}
                      submitLabel="Zapisz zmiany"
                    />
                  </div>
                ) : (
                  <>
                    {/* Wiersz główny */}
                    <div
                      className="px-6 py-4 hover:bg-zinc-800/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === vehicle.id ? null : vehicle.id)}
                    >
                      <div className="grid grid-cols-12 gap-3 items-center">
                        {/* Nr tab */}
                        <div className="col-span-2 md:col-span-1">
                          <span className="inline-flex items-center justify-center w-12 h-10 bg-zinc-950 border border-zinc-800 rounded-xl text-emerald-400 font-bold text-sm">
                            {vehicle.busNumber}
                          </span>
                        </div>

                        {/* Marka / Model */}
                        <div className="col-span-6 md:col-span-3">
                          <p className="text-sm font-medium text-zinc-200">
                            {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.model}
                          </p>
                          {vehicle.registrationNumber && (
                            <p className="text-xs text-zinc-600 mt-0.5">{vehicle.registrationNumber}</p>
                          )}
                        </div>

                        {/* Rodzaj — ukryty na mobile */}
                        <div className="hidden md:block md:col-span-2">
                          <p className="text-xs text-zinc-400">{vehicle.vehicleType || '—'}</p>
                          <p className="text-xs text-zinc-600 mt-0.5">{vehicle.fleetType || ''}</p>
                        </div>

                        {/* Stan */}
                        <div className="hidden md:block md:col-span-2">
                          {statusBadge(vehicle.status)}
                        </div>

                        {/* Kierowca */}
                        <div className="hidden md:flex md:col-span-2 items-center gap-2">
                          {vehicle.assignedDriverId ? (
                            <>
                              <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-medium text-emerald-400 border border-zinc-700">
                                {vehicle.assignedDriverName.charAt(0)}
                              </div>
                              <span className="text-xs text-zinc-300 truncate">{vehicle.assignedDriverName}</span>
                            </>
                          ) : (
                            <span className="text-xs text-zinc-600 italic">Nieprzypisany</span>
                          )}
                        </div>

                        {/* Akcje + chevron */}
                        <div className="col-span-4 md:col-span-2 flex gap-2 items-center justify-end">
                          {isAdmin && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(vehicle); }}
                                className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
                                title="Edytuj"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {vehicle.assignedDriverId && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleUnassign(vehicle); }}
                                  className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                  title="Anuluj przypisanie kierowcy"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                                className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                                title="Usuń pojazd"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <span className="text-zinc-600">
                            {expandedId === vehicle.id
                              ? <ChevronUp className="w-4 h-4" />
                              : <ChevronDown className="w-4 h-4" />
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Panel rozwinięty — szczegóły */}
                    {expandedId === vehicle.id && (
                      <div className="px-6 pb-5 bg-zinc-950/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/60">
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Marka</p>
                            <p className="text-sm text-zinc-200">{vehicle.brand || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Typ / Model</p>
                            <p className="text-sm text-zinc-200">{vehicle.model || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Rodzaj pojazdu</p>
                            <p className="text-sm text-zinc-200">{vehicle.vehicleType || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Typ taboru</p>
                            <p className="text-sm text-zinc-200">{vehicle.fleetType || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Nr rejestracyjny</p>
                            <p className="text-sm text-zinc-200">{vehicle.registrationNumber || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Rok produkcji</p>
                            <p className="text-sm text-zinc-200">{vehicle.yearManufactured || '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Stan</p>
                            {statusBadge(vehicle.status)}
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Kierowca</p>
                            <p className="text-sm text-zinc-200">{vehicle.assignedDriverName || 'Brak'}</p>
                          </div>
                          {vehicle.notes && (
                            <div className="col-span-2 md:col-span-4">
                              <p className="text-xs text-zinc-500 mb-1">Uwagi</p>
                              <p className="text-sm text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5">{vehicle.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// GŁÓWNY KOMPONENT
// ---------------------------------------------------------
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

  const [shiftHistory, setShiftHistory] = useState([]);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState('');

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

  const [fleet, setFleet] = useState([]);

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    if (user.role === 'driver') {
      authFetch(`${API_URL}/api/shifts/${user.id}`)
        .then(res => res.json())
        .then(data => setMyShift(data.shift || null))
        .catch(err => console.error(err));

      fetchShiftHistory(user.id);
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

  const fetchShiftHistory = (driverId) => {
    authFetch(`${API_URL}/api/shifts/history/${driverId}`)
      .then(res => res.json())
      .then(data => setShiftHistory(data.history || []))
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
    setShiftHistory([]); setShowChangePassword(false);
  };

  const submitDriverReport = async () => {
    if (!driverReportFile) return;

    const formData = new FormData();
    formData.append('report_pdf', driverReportFile);
    formData.append('driverId', user.id);
    formData.append('driverName', user.name);
    formData.append('line', myShift?.line ?? 'brak');

    try {
      const res = await authFetch(`${API_URL}/api/reports`, { method: 'POST', body: formData });
      if (res.ok) {
        setIsUploaded(true);
        fetchShiftHistory(user.id);
      }
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

  const handleDeleteDriver = async (driverId) => {
    if (!confirm('Usunąć tego kierowcę? Wszystkie jego służby i raporty zostaną usunięte!')) return;
    try {
      const res = await authFetch(`${API_URL}/api/drivers/${driverId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDrivers();
      } else {
        alert('Błąd podczas usuwania kierowcy');
      }
    } catch (err) { console.error(err); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordMsg('');
    try {
      const res = await authFetch(`${API_URL}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setChangePasswordMsg('✅ Hasło zmienione pomyślnie!');
        setCurrentPassword('');
        setNewPassword('');
        setTimeout(() => {
          setShowChangePassword(false);
          setChangePasswordMsg('');
        }, 2000);
      } else {
        setChangePasswordMsg('❌ ' + (data.error || 'Błąd'));
      }
    } catch (err) {
      setChangePasswordMsg('❌ Błąd połączenia z serwerem');
    }
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

  // Formularz zmiany hasła — współdzielony
  const ChangePasswordForm = () => (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-xl font-medium mb-4 text-zinc-200">Zmiana hasła</h2>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Obecne hasło</label>
            <input
              required type="password"
              value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Nowe hasło (min. 6 znaków)</label>
            <input
              required type="password" minLength={6}
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          {changePasswordMsg && (
            <p className="text-sm text-zinc-300">{changePasswordMsg}</p>
          )}
          <button type="submit" className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm">
            Zmień hasło
          </button>
        </form>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // EKRAN LOGOWANIA
  // ---------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-100 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url('/bg-login.jpg')` }}
        />
        <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm" />

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
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // GŁÓWNY PANEL
  // ---------------------------------------------------------
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
                <button
                  onClick={() => { setActiveTab('dashboard'); setShowChangePassword(false); }}
                  className={`p-2.5 rounded-xl transition-colors ${activeTab === 'dashboard' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Dyspozycja"
                >
                  <Bus className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { setActiveTab('report'); setShowChangePassword(false); }}
                  className={`p-2.5 rounded-xl transition-colors ${activeTab === 'report' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Złóż raport"
                >
                  <FileText className="h-5 w-5" />
                </button>
                <button
                  onClick={() => { setActiveTab('fleet'); setShowChangePassword(false); fetchFleet(); fetchDrivers(); }}
                  className={`p-2.5 rounded-xl transition-colors ${activeTab === 'fleet' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Tabor"
                >
                  <Truck className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowChangePassword(v => !v)}
                  className={`p-2.5 rounded-xl transition-colors ${showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title="Zmień hasło"
                >
                  <KeyRound className="h-5 w-5" />
                </button>
              </>
            )}
            <div className="w-px h-6 bg-zinc-800 my-auto mx-1"></div>
            <button onClick={handleLogout} className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl" title="Wyloguj">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 space-y-6">

          {showChangePassword && <ChangePasswordForm />}

          {/* WIDOK KIEROWCY */}
          {user.role === 'driver' && !showChangePassword && activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-500 space-y-6">
              <div>
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
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-zinc-400" />
                            <div><p className="text-xs text-zinc-500">Rozkład jazdy</p><p className="text-xs font-medium text-zinc-400">Pobierz załącznik</p></div>
                          </div>
                          <button
                            onClick={() => downloadProtectedFile(`${API_URL}${myShift.pdfUrl}`)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" /> Otwórz PDF
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500 text-sm">
                    Wolne! Dyspozytor nie przypisał Ci jeszcze żadnej służby na dzisiaj.
                  </div>
                )}
              </div>

              {shiftHistory.length > 0 && (
                <div>
                  <h2 className="text-xl font-medium mb-4 text-zinc-200">Historia służb</h2>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                    <div className="divide-y divide-zinc-800/60">
                      {shiftHistory.map(s => (
                        <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-zinc-800 text-zinc-100 rounded-xl flex items-center justify-center font-bold text-sm">
                              {s.line}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-200">Brygada {s.brigade}</p>
                              <p className="text-xs text-zinc-500">{s.startTime} – {s.endTime} | Wóz: {s.bus}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            s.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {s.status === 'completed' ? 'Zakończona' : 'Anulowana'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {user.role === 'driver' && !showChangePassword && activeTab === 'report' && (
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
                    <button onClick={submitDriverReport} disabled={!driverReportFile} className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-sm font-medium">
                      Wyślij raport
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === 'driver' && !showChangePassword && activeTab === 'fleet' && (
            <FleetView
              isAdmin={false}
              fleet={fleet}
              driversList={driversList}
              onRefresh={fetchFleet}
            />
          )}

          {/* PANEL ADMINA */}
          {user.role === 'admin' && !showChangePassword && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit overflow-x-auto">
                <button onClick={() => setAdminSubTab('assign')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'assign' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <Plus className="w-4 h-4" /> Wystaw Służbę
                </button>
                <button onClick={() => setAdminSubTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'reports' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <FileCheck className="w-4 h-4" /> Raporty
                </button>
                <button onClick={() => setAdminSubTab('crew')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'crew' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <Users className="w-4 h-4" /> Załoga
                </button>
                <button onClick={() => { setAdminSubTab('fleet'); fetchFleet(); fetchDrivers(); }} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'fleet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <Truck className="w-4 h-4" /> Tabor
                </button>
              </div>

              {adminSubTab === 'crew' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 h-fit">
                    <h2 className="text-xl font-medium text-zinc-200 mb-4 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-emerald-400" /> Dodaj kierowcę
                    </h2>
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
                          <input required type="password" placeholder="np. vPKM123" value={newDriverPass} onChange={(e) => setNewDriverPass(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50" />
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
                              <p className="text-xs text-zinc-500">Login: {d.login}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-zinc-800 text-zinc-400 rounded-md text-xs font-medium">Kierowca</span>
                              <button
                                onClick={() => handleDeleteDriver(d.id)}
                                className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                                title="Usuń kierowcę"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </div>
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
                    <div className="py-12 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8" /></div>
                      <h3 className="text-lg font-medium text-white">Służba przypisana poprawnie!</h3>
                    </div>
                  ) : (
                    <form onSubmit={handleAssignShift} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1.5">Wybierz Kierowcę</label>
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
                              <div className="flex flex-col items-center gap-2 text-center px-4">
                                <FileUp className="w-6 h-6 text-zinc-600 group-hover:text-emerald-400" />
                                <span className="text-xs font-medium text-zinc-400 truncate max-w-full">{assignPdf ? assignPdf.name : "Wgraj rozkład .pdf"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-zinc-800/80">
                        <button type="submit" disabled={driversList.length === 0} className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm flex items-center gap-2 disabled:bg-zinc-800 disabled:text-zinc-600">
                          <Plus className="w-4 h-4" /> Wyślij dyspozycję
                        </button>
                      </div>
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
                            <button
                              onClick={() => downloadProtectedFile(`${API_URL}${report.pdfUrl}`)}
                              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300"
                            >
                              <FileText className="w-4 h-4 text-emerald-400" /> Pobierz Raport PDF
                            </button>
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
                <FleetView
                  isAdmin={true}
                  fleet={fleet}
                  driversList={driversList}
                  onRefresh={fetchFleet}
                />
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}