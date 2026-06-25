import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bus, LogOut, Download, UploadCloud, 
  FileText, CheckCircle, Plus, FileCheck, XCircle, FileUp, Users, UserPlus, ShieldAlert,
  Pencil, Truck, UserX, Save, X, KeyRound, ChevronDown, ChevronUp,
  Bell, BellRing, Send, Trash2, MessageSquare, BookOpen, ExternalLink, Calendar, Image
} from 'lucide-react';

const API_URL = 'https://vpkm-backend-production.up.railway.app';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('vpkm_token');
  return fetch(url, {
    ...options,
    headers: { ...options.headers, ...(token ? { 'Authorization': `Bearer ${token}` } : {}) }
  });
};

const downloadProtectedFile = async (url) => {
  try {
    const res = await authFetch(url);
    if (!res.ok) { alert('Nie udało się pobrać pliku.'); return; }
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
  } catch (err) { console.error(err); alert('Błąd podczas pobierania pliku.'); }
};

// ---------------------------------------------------------
// ROZKŁADY
// ---------------------------------------------------------
const WEEKDAY_LINES = [];
const SATURDAY_LINES = [];
const SUNDAY_LINES = [];

const SchedulesView = () => {
  const [subTab, setSubTab] = useState('weekday');
  const openPdf = (filename) => window.open(`/${filename}`, '_blank', 'noopener,noreferrer');
  const LineRow = ({ label, file }) => (
    <div className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-gzm-yellow" /></div>
        <span className="text-sm font-medium text-zinc-200">{label}</span>
      </div>
      <button onClick={() => openPdf(file)} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors border border-zinc-700">
        <ExternalLink className="w-3.5 h-3.5" /> Otwórz
      </button>
    </div>
  );
  const currentLines = subTab === 'weekday' ? WEEKDAY_LINES : subTab === 'saturday' ? SATURDAY_LINES : SUNDAY_LINES;
  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      <h2 className="text-xl font-medium text-zinc-200 flex items-center gap-2"><BookOpen className="w-5 h-5 text-gzm-yellow" /> Rozkłady jazdy</h2>
      <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
        <button onClick={() => setSubTab('weekday')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${subTab === 'weekday' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Calendar className="w-4 h-4" /> Dni robocze</button>
        <button onClick={() => setSubTab('saturday')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${subTab === 'saturday' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Calendar className="w-4 h-4" /> Sobotnie</button>
        <button onClick={() => setSubTab('sunday')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${subTab === 'sunday' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Calendar className="w-4 h-4" /> Niedzielne</button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-300">{subTab === 'weekday' ? 'Rozkłady — dni robocze' : subTab === 'saturday' ? 'Rozkłady sobotnie' : 'Rozkłady niedzielne'}</h3>
          <span className="text-xs text-zinc-600">{currentLines.length} linii</span>
        </div>
        {currentLines.length === 0 ? (
          <div className="p-12 text-center space-y-2"><FileText className="w-8 h-8 text-zinc-700 mx-auto" /><p className="text-sm text-zinc-500">Brak rozkładów w tej kategorii.</p></div>
        ) : (
          <div className="divide-y divide-zinc-800/60">{currentLines.map((line) => <LineRow key={line.file} label={line.label} file={line.file} />)}</div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// TABOR
// ---------------------------------------------------------

// ZMIANA: usunięte myślniki, sam skrót + opis po spacji
const VEHICLE_TYPES = [
  { value: 'CN', label: 'CN' },
  { value: 'BN', label: 'BN' },
  { value: 'AN', label: 'AN' },
  { value: 'MN', label: 'MN' },
  { value: 'TP', label: 'TP' },
  { value: 'SP', label: 'SP' },
];

const VEHICLE_STATUSES = [
  { value: 'eksploatowany',    label: 'Eksploatowany',    color: 'text-gzm-yellow bg-gzm-yellow/10 border-gzm-yellow/20' },
  { value: 'wycofany',         label: 'Wycofany',          color: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
  { value: 'warsztat',         label: 'Warsztat',          color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { value: 'skasowany',        label: 'Skasowany',         color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { value: 'pojazd_testowy',   label: 'Pojazd testowy',    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { value: 'specjalny',        label: 'Specjalny',         color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { value: 'oczekuje',         label: 'Oczekuje',          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
];

const statusBadge = (value) => {
  const s = VEHICLE_STATUSES.find(x => x.value === value) || VEHICLE_STATUSES[0];
  return <span className={`px-2 py-1 rounded-md text-xs font-medium border ${s.color}`}>{s.label}</span>;
};

const vehicleTypeBadge = (value) => {
  if (!value) return <span className="text-zinc-600 text-xs">—</span>;
  return (
    <span className="px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-md text-xs font-bold text-zinc-300 font-mono">
      {value}
    </span>
  );
};

// ZMIANA: usunięte registrationNumber i fleetType
const emptyVehicle = {
  busNumber: '', brand: '', model: '',
  vehicleType: '',
  status: 'eksploatowany',
  yearManufactured: '',
  assignedDriverId: '', notes: '',
  plateImageUrl: ''
};

// ---------------------------------------------------------
// FleetForm — usunięte pola: registrationNumber, fleetType (typ taboru)
// ---------------------------------------------------------
const FleetForm = ({ values, onChange, driversList, onSubmit, onCancel, submitLabel, onPlateImageChange, plateImagePreview }) => {
  const field = (name) => ({ value: values[name] || '', onChange: (e) => onChange(name, e.target.value) });
  const inputCls = "w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50";
  const labelCls = "block text-xs font-medium text-zinc-500 mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Wiersz 1 — identyfikacja (bez nr rejestracyjnego) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Nr taborowy *</label><input required type="text" placeholder="np. 421" {...field('busNumber')} className={inputCls} /></div>
        <div><label className={labelCls}>Rok produkcji</label><input type="text" placeholder="np. 2019" maxLength={4} {...field('yearManufactured')} className={inputCls} /></div>
      </div>

      {/* Wiersz 2 — marka i model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelCls}>Marka *</label><input required type="text" placeholder="np. Solaris" {...field('brand')} className={inputCls} /></div>
        <div><label className={labelCls}>Typ / Model *</label><input required type="text" placeholder="np. Urbino 18" {...field('model')} className={inputCls} /></div>
      </div>

      {/* Wiersz 3 — klasyfikacja (bez typ taboru) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Rodzaj pojazdu</label>
          <select {...field('vehicleType')} className={inputCls}>
            <option value="">-- wybierz --</option>
            {VEHICLE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
            {driversList.map(d => <option key={d.id} value={d.id}>{d.displayName}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Uwagi</label><input type="text" placeholder="np. tylko trasy płaskie" {...field('notes')} className={inputCls} /></div>
      </div>

      {/* Wiersz 5 — zdjęcie tablicy rejestracyjnej */}
      <div>
        <label className={labelCls}>Zdjęcie tablicy rejestracyjnej (JPG/PNG)</label>
        <div className="flex items-start gap-4">
          <div className="relative flex-1 border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-xl flex items-center justify-center group cursor-pointer h-20">
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={onPlateImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-1 text-center px-4">
              <Image className="w-5 h-5 text-zinc-600 group-hover:text-gzm-yellow" />
              <span className="text-xs text-zinc-500">Wgraj zdjęcie tablicy</span>
            </div>
          </div>
          {(plateImagePreview || values.plateImageUrl) && (
            <div className="flex-shrink-0">
              <img
                src={plateImagePreview || (values.plateImageUrl ? `${API_URL}${values.plateImageUrl}` : '')}
                alt="Tablica rejestracyjna"
                className="h-20 rounded-xl border border-zinc-700 object-cover"
                style={{ maxWidth: '200px' }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors"><Save className="w-4 h-4" /> {submitLabel}</button>
        <button type="button" onClick={onCancel} className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-xl transition-colors"><X className="w-4 h-4" /></button>
      </div>
    </form>
  );
};

// ---------------------------------------------------------
// FleetView — usunięte kolumna "Tablica" z tekstem rej., fleetType z panelu
// ---------------------------------------------------------
const FleetView = ({ isAdmin, fleet, driversList, onRefresh }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [addValues, setAddValues] = useState(emptyVehicle);
  const [addPlateFile, setAddPlateFile] = useState(null);
  const [addPlatePreview, setAddPlatePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState(emptyVehicle);
  const [editPlateFile, setEditPlateFile] = useState(null);
  const [editPlatePreview, setEditPlatePreview] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handlePlateImageChange = (e, setFile, setPreview) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const buildFormData = (values, plateFile, driversList) => {
    const selectedDriver = driversList.find(d => d.id === values.assignedDriverId);
    const formData = new FormData();
    Object.entries(values).forEach(([k, v]) => formData.append(k, v || ''));
    formData.set('assignedDriverName', selectedDriver ? selectedDriver.displayName : 'Brak');
    if (plateFile) formData.append('plate_image', plateFile);
    return formData;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = buildFormData(addValues, addPlateFile, driversList);
      const res = await authFetch(`${API_URL}/api/fleet`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setAddValues(emptyVehicle); setAddPlateFile(null); setAddPlatePreview(null);
        setShowAdd(false); onRefresh();
      }
    } catch (err) { console.error(err); }
  };

  const startEdit = (vehicle) => {
    setEditId(vehicle.id);
    setEditValues({
      busNumber: vehicle.busNumber, brand: vehicle.brand || '', model: vehicle.model,
      vehicleType: vehicle.vehicleType || '',
      status: vehicle.status || 'eksploatowany', yearManufactured: vehicle.yearManufactured || '',
      assignedDriverId: vehicle.assignedDriverId || '',
      notes: vehicle.notes || '', plateImageUrl: vehicle.plateImageUrl || ''
    });
    setEditPlateFile(null); setEditPlatePreview(null);
    setExpandedId(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = buildFormData(editValues, editPlateFile, driversList);
      const res = await authFetch(`${API_URL}/api/fleet/${editId}`, { method: 'PUT', body: formData });
      if (res.ok) { setEditId(null); setEditPlateFile(null); setEditPlatePreview(null); onRefresh(); }
    } catch (err) { console.error(err); }
  };

  const handleUnassign = async (vehicle) => {
    if (!confirm(`Anulować przypisanie kierowcy do wozu #${vehicle.busNumber}?`)) return;
    try {
      const formData = new FormData();
      Object.entries({ ...vehicle, assignedDriverId: '', assignedDriverName: 'Brak' }).forEach(([k, v]) => formData.append(k, v || ''));
      await authFetch(`${API_URL}/api/fleet/${vehicle.id}`, { method: 'PUT', body: formData });
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Usunąć pojazd z taboru?')) return;
    try { await authFetch(`${API_URL}/api/fleet/${id}`, { method: 'DELETE' }); onRefresh(); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-zinc-200">Tabor</h2>
        {isAdmin && <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors"><Plus className="w-4 h-4" /> Dodaj pojazd</button>}
      </div>

      {isAdmin && showAdd && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-5 flex items-center gap-2"><Truck className="w-4 h-4 text-gzm-yellow" /> Nowy pojazd</h3>
          <FleetForm
            values={addValues}
            onChange={(n, v) => setAddValues(x => ({ ...x, [n]: v }))}
            driversList={driversList}
            onSubmit={handleAddSubmit}
            onCancel={() => { setShowAdd(false); setAddPlatePreview(null); setAddPlateFile(null); }}
            submitLabel="Dodaj pojazd"
            onPlateImageChange={(e) => handlePlateImageChange(e, setAddPlateFile, setAddPlatePreview)}
            plateImagePreview={addPlatePreview}
          />
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        {fleet.length === 0 ? (
          <div className="p-10 text-center text-zinc-500 text-sm">Brak pojazdów w taborze.{isAdmin && ' Dodaj pierwszy wóz przyciskiem powyżej.'}</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {/* Nagłówek tabeli — bez kolumny "Tablica" z tekstem */}
            <div className="hidden md:grid px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider" style={{gridTemplateColumns: '60px 1fr 60px 100px 120px 1fr'}}>
              <div>Nr tab.</div>
              <div>Marka / Model</div>
              <div>Typ</div>
              <div>Tablica</div>
              <div>Stan</div>
              <div className="text-right">Akcje</div>
            </div>

            {fleet.map((vehicle) => (
              <div key={vehicle.id}>
                {editId === vehicle.id ? (
                  <div className="px-6 py-5">
                    <p className="text-xs text-zinc-500 mb-4 flex items-center gap-2"><Pencil className="w-3 h-3" /> Edycja: wóz #{vehicle.busNumber}</p>
                    <FleetForm
                      values={editValues}
                      onChange={(n, v) => setEditValues(x => ({ ...x, [n]: v }))}
                      driversList={driversList}
                      onSubmit={handleEditSubmit}
                      onCancel={() => { setEditId(null); setEditPlatePreview(null); setEditPlateFile(null); }}
                      submitLabel="Zapisz zmiany"
                      onPlateImageChange={(e) => handlePlateImageChange(e, setEditPlateFile, setEditPlatePreview)}
                      plateImagePreview={editPlatePreview}
                    />
                  </div>
                ) : (
                  <>
                    <div
                      className="px-6 py-4 hover:bg-zinc-800/20 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(expandedId === vehicle.id ? null : vehicle.id)}
                    >
                      <div className="grid items-center gap-3" style={{gridTemplateColumns: '60px 1fr 60px 100px 120px 1fr'}}>
                        {/* Nr tab */}
                        <span className="inline-flex items-center justify-center w-12 h-10 bg-zinc-950 border border-zinc-800 rounded-xl text-gzm-yellow font-bold text-sm font-mono">{vehicle.busNumber}</span>

                        {/* Marka / Model */}
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : vehicle.model}</p>
                        </div>

                        {/* Typ CN/BN/AN/MN */}
                        <div className="hidden md:block">{vehicleTypeBadge(vehicle.vehicleType)}</div>

                        {/* Tablica rejestracyjna — tylko zdjęcie, bez tekstu fallback */}
                        <div className="hidden md:block">
                          {vehicle.plateImageUrl ? (
                        <img
  src={`${API_URL}${vehicle.plateImageUrl}`}
  alt="Tablica"
  className="h-8 rounded-md object-cover border border-zinc-700"
  style={{ maxWidth: '90px' }}
/>
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </div>

                        {/* Stan */}
                        <div className="hidden md:block">{statusBadge(vehicle.status)}</div>

                        {/* Akcje + chevron */}
                        <div className="flex gap-2 items-center justify-end">
                          {isAdmin && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); startEdit(vehicle); }} className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-zinc-200 hover:bg-zinc-700 transition-colors"><Pencil className="w-4 h-4" /></button>
                              {vehicle.assignedDriverId && <button onClick={(e) => { e.stopPropagation(); handleUnassign(vehicle); }} className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-amber-400 hover:bg-amber-500/10 transition-colors"><UserX className="w-4 h-4" /></button>}
                              <button onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"><XCircle className="w-4 h-4" /></button>
                            </>
                          )}
                          <span className="text-zinc-600">{expandedId === vehicle.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</span>
                        </div>
                      </div>
                    </div>

                    {/* Panel rozwinięty — bez fleetType i registrationNumber */}
                    {expandedId === vehicle.id && (
                      <div className="px-6 pb-5 bg-zinc-950/30">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/60">
                          <div><p className="text-xs text-zinc-500 mb-1">Nr taborowy</p><p className="text-sm text-zinc-200 font-mono font-bold">{vehicle.busNumber}</p></div>
                          <div><p className="text-xs text-zinc-500 mb-1">Marka</p><p className="text-sm text-zinc-200">{vehicle.brand || '—'}</p></div>
                          <div><p className="text-xs text-zinc-500 mb-1">Typ / Model</p><p className="text-sm text-zinc-200">{vehicle.model || '—'}</p></div>
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Rodzaj pojazdu</p>
                            <div className="flex items-center gap-2">
                              {vehicleTypeBadge(vehicle.vehicleType)}
                              <span className="text-xs text-zinc-500">
                                {VEHICLE_TYPES.find(t => t.value === vehicle.vehicleType)?.label?.replace(vehicle.vehicleType, '').trim() || ''}
                              </span>
                            </div>
                          </div>
                          <div><p className="text-xs text-zinc-500 mb-1">Rok produkcji</p><p className="text-sm text-zinc-200">{vehicle.yearManufactured || '—'}</p></div>
                          <div><p className="text-xs text-zinc-500 mb-1">Stan</p>{statusBadge(vehicle.status)}</div>
                          <div className="col-span-2 md:col-span-2">
                            <p className="text-xs text-zinc-500 mb-1">Kierowca</p>
                            <p className="text-sm text-zinc-200">{vehicle.assignedDriverName || 'Brak'}</p>
                          </div>

                          {vehicle.plateImageUrl && (
                            <div className="col-span-2 md:col-span-4">
                              <p className="text-xs text-zinc-500 mb-2">Tablica rejestracyjna</p>
                              <img
                                src={`${API_URL}${vehicle.plateImageUrl}`}
                                alt="Tablica rejestracyjna"
                                className="rounded-xl border border-zinc-700 object-cover cursor-pointer hover:border-zinc-500 transition-colors"
                                style={{ maxHeight: '80px', maxWidth: '300px' }}
                                onClick={() => window.open(`${API_URL}${vehicle.plateImageUrl}`, '_blank')}
                              />
                            </div>
                          )}

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
// ChangePasswordForm
// ---------------------------------------------------------
const ChangePasswordForm = ({ currentPassword, setCurrentPassword, newPassword, setNewPassword, changePasswordMsg, onSubmit }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-medium mb-4 text-zinc-200">Zmiana hasła</h2>
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md">
      <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Obecne hasło</label><input required type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50" /></div>
        <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Nowe hasło (min. 6 znaków)</label><input required type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50" /></div>
        {changePasswordMsg && <p className="text-sm text-zinc-300">{changePasswordMsg}</p>}
        <button type="submit" className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm">Zmień hasło</button>
      </form>
    </div>
  </div>
);

// ---------------------------------------------------------
// MessagesView
// ---------------------------------------------------------
const MessagesView = ({ user, driversList, onUnreadCountChange }) => {
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [newContent, setNewContent] = useState('');
  const [newToId, setNewToId] = useState('');
  const [isGlobal, setIsGlobal] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const isAdmin = user.role === 'admin';

  const fetchMessages = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/messages`);
      const data = await res.json();
      setMessages(data.messages || []);
      const unread = (data.messages || []).filter(m => !m.isRead).length;
      onUnreadCountChange(unread);
    } catch (err) { console.error(err); }
  }, [onUnreadCountChange]);

  const fetchAllMessages = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await authFetch(`${API_URL}/api/messages/all`);
      const data = await res.json();
      setAllMessages(data.messages || []);
    } catch (err) { console.error(err); }
  }, [isAdmin]);

  useEffect(() => { fetchMessages(); if (isAdmin) fetchAllMessages(); }, [fetchMessages, fetchAllMessages]);

  const handleReadAll = async () => {
    try { await authFetch(`${API_URL}/api/messages/read-all`, { method: 'POST' }); fetchMessages(); } catch (err) { console.error(err); }
  };
  const handleRead = async (id) => {
    try { await authFetch(`${API_URL}/api/messages/${id}/read`, { method: 'POST' }); fetchMessages(); } catch (err) { console.error(err); }
  };
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    if (!isGlobal && !newToId) { alert('Wybierz odbiorcę lub zaznacz "Do wszystkich"'); return; }
    setSending(true);
    try {
      const selectedDriver = driversList.find(d => d.id === newToId);
      await authFetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toId: isGlobal ? null : newToId, toName: isGlobal ? null : (selectedDriver ? selectedDriver.displayName : ''), content: newContent, isGlobal })
      });
      setNewContent(''); setNewToId(''); setIsGlobal(false);
      setSendSuccess(true); setTimeout(() => setSendSuccess(false), 2000);
      fetchAllMessages();
    } catch (err) { console.error(err); } finally { setSending(false); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Usunąć ten komunikat?')) return;
    try { await authFetch(`${API_URL}/api/messages/${id}`, { method: 'DELETE' }); fetchAllMessages(); fetchMessages(); } catch (err) { console.error(err); }
  };
  const formatDate = (dateStr) => new Date(dateStr).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const unreadMessages = messages.filter(m => !m.isRead);
  const readMessages = messages.filter(m => m.isRead);

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-medium text-zinc-200 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-gzm-yellow" /> Komunikaty</h2>
        {!isAdmin && unreadMessages.length > 0 && <button onClick={handleReadAll} className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2">Oznacz wszystkie jako przeczytane</button>}
      </div>
      {isAdmin && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-sm font-medium text-zinc-300 mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-gzm-yellow" /> Nowy komunikat</h3>
          {sendSuccess ? (
            <div className="p-4 bg-gzm-yellow/10 border border-gzm-yellow/20 text-gzm-yellow rounded-xl text-sm text-center">✅ Komunikat wysłany!</div>
          ) : (
            <form onSubmit={handleSend} className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isGlobal} onChange={(e) => { setIsGlobal(e.target.checked); setNewToId(''); }} className="w-4 h-4 rounded accent-gzm-yellow" /><span className="text-sm text-zinc-300">Do wszystkich kierowców</span></label>
              {!isGlobal && (
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Odbiorca</label>
                  <select required={!isGlobal} value={newToId} onChange={(e) => setNewToId(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50">
                    <option value="">-- Wybierz kierowcę --</option>
                    {driversList.map(d => <option key={d.id} value={d.id}>{d.displayName} ({d.login})</option>)}
                  </select>
                </div>
              )}
              <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Treść komunikatu</label><textarea required rows={3} value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Wpisz treść komunikatu..." className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50 resize-none" /></div>
              <button type="submit" disabled={sending} className="flex items-center gap-2 px-6 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm transition-colors disabled:opacity-60"><Send className="w-4 h-4" /> {sending ? 'Wysyłanie...' : 'Wyślij komunikat'}</button>
            </form>
          )}
        </div>
      )}
      {!isAdmin && (
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center text-zinc-500 text-sm">Brak komunikatów.</div>
          ) : (
            <>
              {unreadMessages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">Nieodczytane</p>
                  {unreadMessages.map(m => (
                    <div key={m.id} className="bg-zinc-900 border border-gzm-yellow/20 rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full bg-gzm-yellow flex-shrink-0"></span><span className="text-xs font-medium text-gzm-yellow">{m.isGlobal ? '📢 Ogłoszenie dla wszystkich' : `Od: ${m.fromName}`}</span><span className="text-xs text-zinc-600 ml-auto">{formatDate(m.createdAt)}</span></div>
                          <p className="text-sm text-zinc-200 leading-relaxed">{m.content}</p>
                        </div>
                        <button onClick={() => handleRead(m.id)} className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-gzm-yellow transition-colors"><CheckCircle className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {readMessages.length > 0 && (
                <div className="space-y-2">
                  {unreadMessages.length > 0 && <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider px-1 pt-2">Przeczytane</p>}
                  {readMessages.map(m => (
                    <div key={m.id} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-1.5"><span className="text-xs text-zinc-500">{m.isGlobal ? '📢 Ogłoszenie' : `Od: ${m.fromName}`}</span><span className="text-xs text-zinc-600 ml-auto">{formatDate(m.createdAt)}</span></div>
                      <p className="text-sm text-zinc-400 leading-relaxed">{m.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {isAdmin && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-zinc-800/80"><h3 className="text-sm font-medium text-zinc-300">Wysłane komunikaty</h3></div>
          {allMessages.length === 0 ? <div className="p-8 text-center text-zinc-500 text-sm">Brak wysłanych komunikatów.</div> : (
            <div className="divide-y divide-zinc-800/60">
              {allMessages.map(m => (
                <div key={m.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {m.isGlobal ? <span className="px-2 py-0.5 bg-gzm-yellow/10 text-gzm-yellow border border-gzm-yellow/20 rounded-md text-xs font-medium">📢 Dla wszystkich</span> : <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md text-xs font-medium">→ {m.toName}</span>}
                      <span className="text-xs text-zinc-600">{formatDate(m.createdAt)}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{m.content}</p>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="flex-shrink-0 p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
  const [editDriverId, setEditDriverId] = useState(null);
  const [editDriverValues, setEditDriverValues] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [myShift, setMyShift] = useState(null);
  const [driverReportFile, setDriverReportFile] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePasswordMsg, setChangePasswordMsg] = useState('');
  const [assignDriverId, setAssignDriverId] = useState('');
  const [assignCategory, setAssignCategory] = useState('weekday'); // 'weekend' albo 'weekday'
  const [assignLine, setAssignLine] = useState('');
  const [assignShift, setAssignShift] = useState('');
  const [assignScheduleFile, setAssignScheduleFile] = useState('');
  const [assignNote, setAssignNote] = useState(''); // opcjonalna notatka, zamiast brygady
  const [assignStart, setAssignStart] = useState('');
  const [assignEnd, setAssignEnd] = useState('');
  const [assignBusId, setAssignBusId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);
  const [pendingReports, setPendingReports] = useState([]);
  const [driversList, setDriversList] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [newDriverLogin, setNewDriverLogin] = useState('');
  const [newDriverPass, setNewDriverPass] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverSuccess, setNewDriverSuccess] = useState(false);
  const [fleet, setFleet] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const fetchUnread = async () => {
      try { const res = await authFetch(`${API_URL}/api/messages/unread-count`); const data = await res.json(); setUnreadCount(data.count || 0); } catch (err) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

useEffect(() => {
  if (!isLoggedIn || !user) return;
  if (user.role === 'driver') {
    authFetch(`${API_URL}/api/shifts/${user.id}`).then(r => r.json()).then(d => setMyShift(d.shift || null)).catch(console.error);
    fetchShiftHistory(user.id);
    fetchMyProfile();
  }
  if (user.role === 'admin') {
    fetchDrivers(); fetchActiveShifts(); fetchFleet();
    if (adminSubTab === 'reports') fetchReports();
}
  if (user.role === 'driver' && activeTab === 'fleet') { fetchFleet(); fetchDrivers(); }
}, [isLoggedIn, user, adminSubTab, activeTab]);

  const fetchReports = () => authFetch(`${API_URL}/api/reports/pending`).then(r => r.json()).then(d => setPendingReports(d.reports)).catch(console.error);
  const fetchDrivers = () => authFetch(`${API_URL}/api/drivers`).then(r => r.json()).then(d => setDriversList(Array.isArray(d) ? d : [])).catch(console.error);
  const fetchActiveShifts = () => authFetch(`${API_URL}/api/shifts`).then(r => r.json()).then(d => setActiveShifts(d.shifts || [])).catch(console.error);
  const fetchFleet = () => authFetch(`${API_URL}/api/fleet`).then(r => r.json()).then(d => setFleet(Array.isArray(d) ? d : [])).catch(console.error);
  const fetchShiftHistory = (id) => authFetch(`${API_URL}/api/shifts/history/${id}`).then(r => r.json()).then(d => setShiftHistory(d.history || [])).catch(console.error);
  const fetchMyProfile = () => authFetch(`${API_URL}/api/drivers/me`).then(r => r.json()).then(d => setMyProfile(d)).catch(console.error);
  const handleCancelShift = async (driverId) => {
    if (!confirm('Anulować tę służbę?')) return;
    try { await authFetch(`${API_URL}/api/shifts/${driverId}`, { method: 'DELETE' }); fetchActiveShifts(); } catch (err) { console.error(err); }
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoginError(''); setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: email, password }) });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('vpkm_token', data.token);
        setUser({ id: data.user.id, name: data.user.displayName, role: data.user.role, avatar: data.user.displayName.charAt(0).toUpperCase() });
        setIsLoggedIn(true);
        setActiveTab(data.user.role === 'admin' ? 'admin' : 'dashboard');
      } else { setLoginError(data.message); }
    } catch { setLoginError("Błąd łączenia z serwerem."); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('vpkm_token');
    setIsLoggedIn(false); setUser(null); setDriverReportFile(null);
    setIsUploaded(false); setEmail(''); setPassword(''); setMyShift(null);
    setShiftHistory([]); setShowChangePassword(false); setUnreadCount(0);
  };

  const submitDriverReport = async () => {
    if (!driverReportFile) return;
    const formData = new FormData();
    formData.append('report_pdf', driverReportFile); formData.append('driverId', user.id);
    formData.append('driverName', user.name); formData.append('line', myShift?.line ?? 'brak');
    try { const res = await authFetch(`${API_URL}/api/reports`, { method: 'POST', body: formData }); if (res.ok) { setIsUploaded(true); fetchShiftHistory(user.id); } } catch (err) { console.error(err); }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_URL}/api/drivers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: newDriverLogin, password: newDriverPass, displayName: newDriverName }) });
      const data = await res.json();
      if (data.success) { setNewDriverSuccess(true); setNewDriverLogin(''); setNewDriverPass(''); setNewDriverName(''); fetchDrivers(); setTimeout(() => setNewDriverSuccess(false), 3000); }
      else { alert(data.message); }
    } catch (error) { console.error(error); }
  };

  const handleDeleteDriver = async (driverId) => {
    if (!confirm('Usunąć tego kierowcę?')) return;
    try { const res = await authFetch(`${API_URL}/api/drivers/${driverId}`, { method: 'DELETE' }); if (res.ok) fetchDrivers(); else alert('Błąd podczas usuwania'); } catch (err) { console.error(err); }
  };
  const startEditDriver = (d) => {
  setEditDriverId(d.id);
  setEditDriverValues({
    displayName: d.displayName, employeeNumber: d.employeeNumber || '', fullName: d.fullName || '',
    robloxNick: d.robloxNick || '', position: d.position || '',
    employmentStatus: d.employmentStatus || 'pracujacy', additionalInfo: d.additionalInfo || '',
    points: d.points ?? 0, minuses: d.minuses ?? 0
  });
};

const handleSaveDriver = async (e) => {
  e.preventDefault();
  try {
    const res = await authFetch(`${API_URL}/api/drivers/${editDriverId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editDriverValues)
    });
    if (res.ok) { setEditDriverId(null); fetchDrivers(); }
  } catch (err) { console.error(err); }
};

  const handleChangePassword = async (e) => {
    e.preventDefault(); setChangePasswordMsg('');
    try {
      const res = await authFetch(`${API_URL}/api/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      if (res.ok) { setChangePasswordMsg('✅ Hasło zmienione pomyślnie!'); setCurrentPassword(''); setNewPassword(''); setTimeout(() => { setShowChangePassword(false); setChangePasswordMsg(''); }, 2000); }
      else { setChangePasswordMsg('❌ ' + (data.error || 'Błąd')); }
    } catch { setChangePasswordMsg('❌ Błąd połączenia z serwerem'); }
  };

const handleAssignShift = async (e) => {
    e.preventDefault();
    if (!assignDriverId || !assignLine || !assignBusId) { alert("Wybierz kierowcę, linię i pojazd!"); return; }
    const selectedDriver = driversList.find(d => d.id === assignDriverId);
    const selectedVehicle = fleet.find(v => v.id === assignBusId);
    const busLabel = selectedVehicle ? `${selectedVehicle.brand || ''} ${selectedVehicle.model || ''} (#${selectedVehicle.busNumber})`.trim() : '';
    try {
      const response = await authFetch(`${API_URL}/api/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
  driverId: selectedDriver.id,
  driverName: selectedDriver.displayName,
  line: assignLine,
  brigade: assignNote,
  shift: assignShift,
  bus: busLabel,
  startTime: assignStart,
  endTime: assignEnd,
  scheduleFile: assignScheduleFile
})
      });
      if (response.ok) {
        setAssignSuccess(true); fetchActiveShifts();
        setTimeout(() => {
          setAssignSuccess(false); setAssignDriverId(''); setAssignLine(''); setAssignNote('');
          setAssignBusId(''); setAssignStart(''); setAssignEnd(''); setAssignScheduleFile(''); setAssignCategory('weekend'); setAssignShift('');
        }, 3000);
      } else { alert('Błąd podczas wystawiania służby.'); }
    } catch (err) { console.error(err); }
};

  const handleReportAction = async (id, action) => {
    try { const response = await authFetch(`${API_URL}/api/reports/${id}/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) }); if (response.ok) fetchReports(); } catch (err) { console.error(err); }
  };

  if (!isLoggedIn) {
    return (
      <div className="relative min-h-screen bg-gzm-black flex items-center justify-center p-4 font-inter text-zinc-100 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url('/bg-login.jpg')` }} />
        <div className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md bg-zinc-900/60 p-8 sm:p-10 rounded-3xl border border-zinc-800/80 backdrop-blur-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-zinc-950/60 rounded-2xl mb-4 border border-zinc-800/50">
  <img src="/logo.png" alt="logo" className="h-6 w-6 object-contain" />
</div>
            <h1 className="text-2xl font-semibold tracking-tight">vPKM Tychy</h1>
            <p className="text-zinc-400 text-sm mt-1">Panel Pracowniczy</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> {loginError}</div>}
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gzm-yellow/40 focus:bg-zinc-950/80 transition-colors text-sm" placeholder="Login z gry" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-zinc-950/40 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-gzm-yellow/40 focus:bg-zinc-950/80 transition-colors text-sm" placeholder="Hasło dyspozytorskie" />
            <button type="submit" disabled={isLoading} className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl transition-colors text-sm mt-2 shadow-lg disabled:opacity-60">{isLoading ? 'Łączenie...' : 'Zaloguj się'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gzm-black text-zinc-100 font-inter flex justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl flex flex-col gap-6">

        <header className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-800 rounded-full flex items-center justify-center font-medium text-gzm-yellow border border-zinc-700">{user.avatar}</div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-zinc-500">{user.role === 'admin' ? 'Centrala Dyspozytorska' : 'Kierowca Liniowy'}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {user.role === 'driver' && (
              <>
                <button onClick={() => { setActiveTab('dashboard'); setShowChangePassword(false); }} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'dashboard' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title="Dyspozycja"><Bus className="h-5 w-5" /></button>
                <button onClick={() => { setActiveTab('report'); setShowChangePassword(false); }} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'report' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title="Złóż raport"><FileText className="h-5 w-5" /></button>
                <button onClick={() => { setActiveTab('fleet'); setShowChangePassword(false); fetchFleet(); fetchDrivers(); }} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'fleet' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title="Tabor"><Truck className="h-5 w-5" /></button>
                <button onClick={() => { setActiveTab('schedules'); setShowChangePassword(false); }} className={`p-2.5 rounded-xl transition-colors ${activeTab === 'schedules' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title="Rozkłady jazdy"><BookOpen className="h-5 w-5" /></button>
                <button onClick={() => { setActiveTab('messages'); setShowChangePassword(false); setUnreadCount(0); }} className={`relative p-2.5 rounded-xl transition-colors ${activeTab === 'messages' && !showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title="Komunikaty">
                  {unreadCount > 0 ? <BellRing className="h-5 w-5 text-gzm-yellow" /> : <Bell className="h-5 w-5" />}
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gzm-yellow text-zinc-950 text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
                <button onClick={() => setShowChangePassword(v => !v)} className={`p-2.5 rounded-xl transition-colors ${showChangePassword ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`} title="Zmień hasło"><KeyRound className="h-5 w-5" /></button>
              </>
            )}
            <div className="w-px h-6 bg-zinc-800 my-auto mx-1"></div>
            <button onClick={handleLogout} className="p-2.5 text-zinc-500 hover:text-red-400 transition-colors rounded-xl" title="Wyloguj"><LogOut className="h-5 w-5" /></button>
          </div>
        </header>

        <main className="flex-1 space-y-6">
          <div className="flex items-center gap-3 px-4 py-3 bg-gzm-yellow/10 border border-gzm-yellow/40 rounded-2xl text-gzm-yellow text-sm font-medium">
  <span className="flex-shrink-0">⚠️</span>
  Od dnia 29.06.2026 r. do dnia 31.08.2026 r. obowiązują rozkłady wakacyjne.
</div>
          {showChangePassword && <ChangePasswordForm currentPassword={currentPassword} setCurrentPassword={setCurrentPassword} newPassword={newPassword} setNewPassword={setNewPassword} changePasswordMsg={changePasswordMsg} onSubmit={handleChangePassword} />}

          {user.role === 'driver' && !showChangePassword && activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-500 space-y-6">
                {/* 🆕 WKLEJ TUTAJ blok profilu */}
    {myProfile && (
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h2 className="text-xl font-medium text-zinc-200">Mój profil</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><p className="text-xs text-zinc-500 mb-1">Nr służbowy</p><p className="text-sm text-zinc-200 font-mono">{myProfile.employeeNumber || '—'}</p></div>
          <div><p className="text-xs text-zinc-500 mb-1">Imię i nazwisko</p><p className="text-sm text-zinc-200">{myProfile.fullName || '—'}</p></div>
          <div><p className="text-xs text-zinc-500 mb-1">Nick Roblox</p><p className="text-sm text-zinc-200">{myProfile.robloxNick || '—'}</p></div>
          <div><p className="text-xs text-zinc-500 mb-1">Stanowisko</p><p className="text-sm text-zinc-200">{myProfile.position || '—'}</p></div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Status</p>
            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${myProfile.employmentStatus === 'pracujacy' ? 'text-gzm-yellow bg-gzm-yellow/10 border-gzm-yellow/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
              {myProfile.employmentStatus === 'pracujacy' ? 'Pracujący' : 'Zwolniony'}
            </span>
          </div>
          <div><p className="text-xs text-zinc-500 mb-1">Punkty</p><p className="text-sm font-medium text-gzm-yellow">{myProfile.points ?? 0}</p></div>
          <div><p className="text-xs text-zinc-500 mb-1">Minusy</p><p className="text-sm font-medium text-red-400">{myProfile.minuses ?? 0}</p></div>
        </div>
        {myProfile.additionalInfo && (
          <div><p className="text-xs text-zinc-500 mb-1">Dodatkowe informacje</p><p className="text-sm text-zinc-300 bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2.5">{myProfile.additionalInfo}</p></div>
        )}
      </div>
    )}
    {/* 🆕 KONIEC bloku profilu */}
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
                        <div><p className="text-xs text-zinc-500 mb-1">Pojazd</p><p className="text-sm font-medium text-gzm-yellow">{myShift.bus}</p></div>
                        <div><p className="text-xs text-zinc-500 mb-1">Godziny</p><p className="text-sm font-medium">{myShift.startTime} - {myShift.endTime}</p></div>
                      </div>
                    </div>
                    {myShift.pdfUrl && (
                      <div className="flex flex-col justify-center min-w-[220px]">
                        <div className="p-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 space-y-4">
                          <div className="flex items-center gap-3"><FileText className="w-8 h-8 text-zinc-400" /><div><p className="text-xs text-zinc-500">Rozkład jazdy</p><p className="text-xs font-medium text-zinc-400">Pobierz załącznik</p></div></div>
                          <a href={myShift.pdfUrl} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-100 hover:bg-white text-zinc-900 rounded-xl text-sm font-medium transition-colors"><Download className="w-4 h-4" /> Otwórz PDF</a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-500 text-sm">Wolne! Dyspozytor nie przypisał Ci jeszcze żadnej służby na dzisiaj.</div>
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
                            <div className="h-10 w-10 bg-zinc-800 text-zinc-100 rounded-xl flex items-center justify-center font-bold text-sm">{s.line}</div>
                            <div><p className="text-sm font-medium text-zinc-200">Brygada {s.brigade}</p><p className="text-xs text-zinc-500">{s.startTime} – {s.endTime} | Wóz: {s.bus}</p></div>
                          </div>
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${s.status === 'completed' ? 'bg-gzm-yellow/10 text-gzm-yellow border border-gzm-yellow/20' : 'bg-zinc-800 text-zinc-500'}`}>{s.status === 'completed' ? 'Zakończona' : 'Anulowana'}</span>
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
                  <div className="space-y-4 py-8"><div className="mx-auto w-16 h-16 bg-gzm-yellow/10 text-gzm-yellow rounded-full flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8" /></div><h3 className="text-xl font-medium">Raport dostarczony</h3></div>
                ) : (
                  <div className="max-w-md mx-auto space-y-6">
                    <p className="text-sm text-zinc-400">Wyślij plik PDF z podsumowaniem służby.</p>
                    <div className="relative border-2 border-dashed border-zinc-700 hover:border-zinc-500 bg-zinc-950/50 rounded-2xl p-8 group cursor-pointer">
                      <input type="file" accept=".pdf" onChange={(e) => setDriverReportFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex flex-col items-center gap-3"><UploadCloud className="w-10 h-10 text-zinc-600 group-hover:text-gzm-yellow" /><p className="text-sm font-medium text-zinc-300">{driverReportFile ? driverReportFile.name : "Wybierz plik PDF"}</p></div>
                    </div>
                    <button onClick={submitDriverReport} disabled={!driverReportFile} className="w-full py-3.5 bg-zinc-100 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-sm font-medium">Wyślij raport</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {user.role === 'driver' && !showChangePassword && activeTab === 'fleet' && <FleetView isAdmin={false} fleet={fleet} driversList={driversList} onRefresh={fetchFleet} />}
          {user.role === 'driver' && !showChangePassword && activeTab === 'schedules' && <SchedulesView />}
          {user.role === 'driver' && !showChangePassword && activeTab === 'messages' && <MessagesView user={user} driversList={driversList} onUnreadCountChange={setUnreadCount} />}

          {user.role === 'admin' && !showChangePassword && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit overflow-x-auto">
                <button onClick={() => setAdminSubTab('assign')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'assign' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Plus className="w-4 h-4" /> Wystaw Służbę</button>
                <button onClick={() => setAdminSubTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'reports' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><FileCheck className="w-4 h-4" /> Raporty</button>
                <button onClick={() => setAdminSubTab('crew')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'crew' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Users className="w-4 h-4" />Kierowcy</button>
                <button onClick={() => { setAdminSubTab('fleet'); fetchFleet(); fetchDrivers(); }} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'fleet' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><Truck className="w-4 h-4" /> Tabor</button>
                <button onClick={() => setAdminSubTab('schedules')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'schedules' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><BookOpen className="w-4 h-4" /> Rozkłady</button>
                <button onClick={() => { setAdminSubTab('messages'); fetchDrivers(); }} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${adminSubTab === 'messages' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}><MessageSquare className="w-4 h-4" /> Komunikaty</button>
              </div>

              {adminSubTab === 'crew' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 h-fit">
      <h2 className="text-xl font-medium text-zinc-200 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-gzm-yellow" /> Dodaj kierowcę</h2>
      {newDriverSuccess ? (
        <div className="p-4 bg-gzm-yellow/10 border border-gzm-yellow/20 text-gzm-yellow rounded-xl text-sm text-center">Konto zostało pomyślnie utworzone!</div>
      ) : (
        <form onSubmit={handleAddDriver} className="space-y-4">
          <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Nick / Imię w grze</label><input required type="text" placeholder="np. Kacper Nowak" value={newDriverName} onChange={(e) => setNewDriverName(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50" /></div>
          <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Login do panelu</label><input required type="text" placeholder="np. kacper" value={newDriverLogin} onChange={(e) => setNewDriverLogin(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50" /></div>
          <div><label className="block text-xs font-medium text-zinc-500 mb-1.5">Hasło</label><input required type="password" placeholder="np. vPKM123" value={newDriverPass} onChange={(e) => setNewDriverPass(e.target.value)} className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/50" /></div>
          <button type="submit" className="w-full py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-medium rounded-xl text-sm mt-2">Stwórz konto</button>
        </form>
      )}
    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8">
      <h2 className="text-xl font-medium text-zinc-200 mb-4">Zatrudnieni</h2>
      <div className="space-y-2">
        {driversList.length === 0 ? <p className="text-sm text-zinc-500">Brak zarejestrowanych kierowców.</p> : driversList.map(d => (
          <div key={d.id} className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl">
            {editDriverId === d.id ? (
              <form onSubmit={handleSaveDriver} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Nr służbowy" value={editDriverValues.employeeNumber} onChange={e => setEditDriverValues(v => ({...v, employeeNumber: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                  <input placeholder="Imię i nazwisko" value={editDriverValues.fullName} onChange={e => setEditDriverValues(v => ({...v, fullName: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                  <input placeholder="Nick Roblox" value={editDriverValues.robloxNick} onChange={e => setEditDriverValues(v => ({...v, robloxNick: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                  <input placeholder="Stanowisko" value={editDriverValues.position} onChange={e => setEditDriverValues(v => ({...v, position: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                  <select value={editDriverValues.employmentStatus} onChange={e => setEditDriverValues(v => ({...v, employmentStatus: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm">
                    <option value="pracujacy">Pracujący</option>
                    <option value="zwolniony">Zwolniony</option>
                  </select>
                  <input type="number" placeholder="Punkty" value={editDriverValues.points} onChange={e => setEditDriverValues(v => ({...v, points: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                  <input type="number" placeholder="Minusy" value={editDriverValues.minuses} onChange={e => setEditDriverValues(v => ({...v, minuses: e.target.value}))} className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                </div>
                <input placeholder="Dodatkowe informacje" value={editDriverValues.additionalInfo} onChange={e => setEditDriverValues(v => ({...v, additionalInfo: e.target.value}))} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 text-sm" />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-xs font-medium">Zapisz</button>
                  <button type="button" onClick={() => setEditDriverId(null)} className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-xs">Anuluj</button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-zinc-200">{d.fullName || d.displayName} {d.employeeNumber && <span className="text-zinc-500 font-mono text-xs">#{d.employeeNumber}</span>}</p>
                  <p className="text-xs text-zinc-500">Login: {d.login} {d.robloxNick && `· Roblox: ${d.robloxNick}`}</p>
                  <p className="text-xs text-zinc-500">{d.position || '—'}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${d.employmentStatus === 'pracujacy' ? 'text-gzm-yellow bg-gzm-yellow/10 border-gzm-yellow/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>{d.employmentStatus === 'pracujacy' ? 'Pracujący' : 'Zwolniony'}</span>
                    <span className="text-[10px] text-gzm-yellow">+{d.points ?? 0}</span>
                    <span className="text-[10px] text-red-400">-{d.minuses ?? 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEditDriver(d)} className="p-2 bg-zinc-800 text-zinc-400 rounded-xl hover:text-zinc-200"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteDriver(d.id)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20"><UserX className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}

              {adminSubTab === 'assign' && (
  <div className="space-y-4">

    {/* KREATOR */}
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-3xl overflow-hidden backdrop-blur-sm">

      {/* Nagłówek karty */}
      <div className="px-6 pt-6 pb-5 border-b border-zinc-800/50">
        <h2 className="text-base font-semibold text-zinc-100 tracking-tight">Nowa dyspozycja</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Wypełnij pola i wyślij służbę kierowcy</p>
      </div>

      {assignSuccess ? (
        <div className="py-16 flex flex-col items-center text-center px-6">
          <div className="w-14 h-14 bg-gzm-yellow/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-7 h-7 text-gzm-yellow" />
          </div>
          <h3 className="text-base font-semibold text-zinc-100">Służba przypisana</h3>
          <p className="text-xs text-zinc-500 mt-1">Kierowca zobaczy dyspozycję po zalogowaniu</p>
        </div>
      ) : (
        <form onSubmit={handleAssignShift} className="p-6 space-y-3">

          {/* Kierowca */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Kierowca</label>
            <select
              required
              value={assignDriverId}
              onChange={(e) => setAssignDriverId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors appearance-none"
            >
              <option value="">Wybierz kierowcę…</option>
              {driversList.map(d => <option key={d.id} value={d.id}>{d.displayName} ({d.login})</option>)}
            </select>
            {driversList.length === 0 && <p className="text-[10px] text-red-400">Najpierw dodaj kierowcę w zakładce Kierowcy.</p>}
          </div>

          {/* Separator */}
          <div className="h-px bg-zinc-800/50 my-1" />

          {/* Kategoria + Linia — dwa w rzędzie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Kategoria</label>
              <select
                value={assignCategory}
                onChange={(e) => { setAssignCategory(e.target.value); setAssignLine(''); setAssignScheduleFile(''); }}
                className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors appearance-none"
              >
                <option value="weekday">Dni robocze</option>
                <option value="saturday">Sobotnie</option>
                <option value="sunday">Niedzielne</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Linia</label>
              {(assignCategory === 'weekday' ? WEEKDAY_LINES : assignCategory === 'saturday' ? SATURDAY_LINES : SUNDAY_LINES).length > 0 ? (
                <select
                  required
                  value={assignLine}
                  onChange={(e) => {
                    const lines = assignCategory === 'weekday' ? WEEKDAY_LINES : assignCategory === 'saturday' ? SATURDAY_LINES : SUNDAY_LINES;
                    const selected = lines.find(l => l.label === e.target.value);
                    setAssignLine(e.target.value);
                    setAssignScheduleFile(selected ? selected.file : '');
                  }}
                  className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors appearance-none"
                >
                  <option value="">Wybierz linię…</option>
                  {(assignCategory === 'weekday' ? WEEKDAY_LINES : assignCategory === 'saturday' ? SATURDAY_LINES : SUNDAY_LINES).map(l => (
                    <option key={l.file} value={l.label}>{l.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  required
                  type="text"
                  placeholder="Wpisz nr linii…"
                  value={assignLine}
                  onChange={(e) => setAssignLine(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors"
                />
              )}
            </div>
          </div>

          {/* Pojazd + Zmiana — dwa w rzędzie */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Pojazd</label>
              <select
                required
                value={assignBusId}
                onChange={(e) => setAssignBusId(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors appearance-none"
              >
                <option value="">Wybierz pojazd…</option>
                {fleet.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} (#{v.busNumber})</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Zmiana</label>
              <select
                value={assignShift}
                onChange={(e) => setAssignShift(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors appearance-none"
              >
                <option value="">Wybierz zmianę…</option>
                <option value="A">Zmiana A</option>
                <option value="B">Zmiana B</option>
                <option value="A+B">Zmiana A+B</option>
              </select>
            </div>
          </div>

          {/* Godziny — dwa w rzędzie */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Rozpoczęcie</label>
              <input
                required
                type="time"
                value={assignStart}
                onChange={(e) => setAssignStart(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-300 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Zakończenie</label>
              <input
                required
                type="time"
                value={assignEnd}
                onChange={(e) => setAssignEnd(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-300 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors"
              />
            </div>
          </div>

          {/* Notatka */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Notatka <span className="normal-case text-zinc-600">(opcjonalnie)</span></label>
            <input
              type="text"
              placeholder="np. uwagi dla kierowcy"
              value={assignNote}
              onChange={(e) => setAssignNote(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-zinc-200 text-sm focus:outline-none focus:border-gzm-yellow/40 transition-colors"
            />
          </div>

          {/* Przycisk */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={driversList.length === 0}
              className="w-full py-3.5 bg-gzm-yellow hover:bg-gzm-yellow-dark text-zinc-900 font-semibold rounded-2xl text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Wyślij dyspozycję
            </button>
          </div>

        </form>
      )}
    </div>

    {/* AKTYWNE SŁUŻBY */}
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-3xl overflow-hidden backdrop-blur-sm">
      <div className="px-6 pt-5 pb-4 border-b border-zinc-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">Aktywne służby</h3>
        <span className="text-xs text-zinc-600">{activeShifts.length} aktywnych</span>
      </div>
      {activeShifts.length === 0 ? (
        <div className="px-6 py-8 text-center text-zinc-600 text-xs">Brak aktywnych służb.</div>
      ) : (
        <div className="divide-y divide-zinc-800/40">
          {activeShifts.map(s => (
            <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gzm-yellow/10 border border-gzm-yellow/20 rounded-xl flex items-center justify-center text-xs font-bold text-gzm-yellow font-mono">
                  {s.line}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-200">{s.driverName}</p>
                  <p className="text-xs text-zinc-500">{s.startTime}–{s.endTime} · {s.bus}</p>
                </div>
              </div>
              <button
                onClick={() => handleCancelShift(s.driverId)}
                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                title="Anuluj służbę"
              >
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
                  {pendingReports.length === 0 ? <div className="p-10 text-center text-zinc-500 text-sm">Wszystkie raporty zostały sprawdzone.</div> : (
                    <div className="divide-y divide-zinc-800/60">
                      {pendingReports.map((report) => (
                        <div key={report.id} className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-zinc-800/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-zinc-800 text-zinc-100 rounded-xl flex items-center justify-center font-bold text-lg">{report.line}</div>
                            <div><p className="font-medium text-zinc-200">{report.driverName}</p><p className="text-xs text-zinc-500">Wysłano: {report.date}</p></div>
                          </div>
                          <div className="flex items-center gap-3 w-full lg:w-auto">
                            <button onClick={() => downloadProtectedFile(`${API_URL}${report.pdfUrl}`)} className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-zinc-300"><FileText className="w-4 h-4 text-gzm-yellow" /> Pobierz Raport PDF</button>
                            <div className="flex gap-2">
                              <button onClick={() => handleReportAction(report.id, 'approve')} className="p-2.5 bg-gzm-yellow/10 text-gzm-yellow rounded-xl border border-gzm-yellow/20"><CheckCircle className="w-5 h-5" /></button>
                              <button onClick={() => handleReportAction(report.id, 'reject')} className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"><XCircle className="w-5 h-5" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {adminSubTab === 'fleet' && <FleetView isAdmin={true} fleet={fleet} driversList={driversList} onRefresh={fetchFleet} />}
              {adminSubTab === 'schedules' && <SchedulesView />}
              {adminSubTab === 'messages' && <MessagesView user={user} driversList={driversList} onUnreadCountChange={() => {}} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}