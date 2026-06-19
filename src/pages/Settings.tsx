// src/pages/Settings.tsx
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/contexts/AuthContext';
import type { DatabaseInfo, ImportResult } from '@/types/electron.types';
import { formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
  AlertTriangle, CheckCircle2,
  Database, Download,
  FileJson, FolderOpen,
  Info, KeyRound, Loader2,
  Lock, RefreshCw, ShieldCheck, ShieldOff,
  Upload,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const api = () => (window as any).electronAPI;

const PIN_LENGTH = 6;

// ── Small section card ────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; description?: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  title, description, children, icon,
}) => (
  <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
    <div className="flex items-start gap-2">
      {icon && <span className="mt-0.5 text-slate-500">{icon}</span>}
      <div>
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Info row ──────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
    <span className="text-xs text-slate-500">{label}</span>
    <span className="text-xs font-mono text-slate-300 max-w-xs truncate text-right">{value}</span>
  </div>
);

// ── Alert banner ──────────────────────────────────────────────────────────────
const Alert: React.FC<{ type: 'success' | 'error' | 'info'; message: string }> = ({ type, message }) => {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  };
  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? AlertTriangle : Info;
  return (
    <div className={clsx('flex items-start gap-2 px-3 py-2.5 rounded-xl border text-xs', styles[type])}>
      <Icon size={13} className="mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

// ── PIN input row ─────────────────────────────────────────────────────────────
const PinRow: React.FC<{
  label: string;
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onComplete?: (full: string) => void;
  error?: string;
}> = ({ label, value, onChange, refs, onComplete, error }) => {
  const handleDigit = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...value];
    next[idx] = val;
    onChange(next);
    if (val && idx < PIN_LENGTH - 1) refs.current[idx + 1]?.focus();
    if (val && idx === PIN_LENGTH - 1) {
      const full = next.join('');
      if (full.length === PIN_LENGTH) onComplete?.(full);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'Backspace' && !refs.current[idx]?.value && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        {value.map((v, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={v}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={clsx(
              'w-10 h-12 text-center text-lg font-bold bg-slate-900 border-2 rounded-xl outline-none transition-all duration-200 text-cyan-300 caret-cyan-400',
              error
                ? 'border-red-500 focus:border-red-400'
                : 'border-slate-700 focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(34,211,238,0.3)]'
            )}
            placeholder="•"
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

const emptyPin = () => Array(PIN_LENGTH).fill('');

// ── Change PIN Modal ──────────────────────────────────────────────────────────
const ChangePinModal: React.FC<{ open: boolean; onClose: () => void; isSettingNew: boolean; onSuccess: () => void; onPinSet?: (pin: string) => Promise<void> }> = ({
  open, onClose, isSettingNew, onSuccess, onPinSet,
}) => {
  const [currentPin, setCurrentPin] = useState<string[]>(emptyPin());
  const [newPin, setNewPin] = useState<string[]>(emptyPin());
  const [confirmPin, setConfirmPin] = useState<string[]>(emptyPin());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const currentRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  const reset = () => {
    setCurrentPin(emptyPin());
    setNewPin(emptyPin());
    setConfirmPin(emptyPin());
    setError('');
    setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  useEffect(() => {
    if (open) {
      reset();
      setTimeout(() => {
        const firstRef = isSettingNew ? newRefs : currentRefs;
        firstRef.current[0]?.focus();
      }, 100);
    }
  }, [open, isSettingNew]);

  const handleSubmit = async () => {
    const newFull = newPin.join('');
    const confirmFull = confirmPin.join('');

    if (newFull.length < PIN_LENGTH) { setError('Please enter a full 6-digit new PIN.'); return; }
    if (newFull !== confirmFull) {
      setError('New PINs do not match.');
      setNewPin(emptyPin());
      setConfirmPin(emptyPin());
      setTimeout(() => newRefs.current[0]?.focus(), 50);
      return;
    }

    if (!isSettingNew) {
      const currentFull = currentPin.join('');
      if (currentFull.length < PIN_LENGTH) { setError('Please enter your current PIN.'); return; }
      setLoading(true);
      const valid = await api().authVerifyPin(currentFull);
      if (!valid) {
        setError('Current PIN is incorrect.');
        setCurrentPin(emptyPin());
        setLoading(false);
        setTimeout(() => currentRefs.current[0]?.focus(), 50);
        return;
      }
    }

    setLoading(true);
    if (onPinSet) {
      await onPinSet(newFull);
    } else {
      await api().authSetPin(newFull);
    }
    setLoading(false);
    reset();
    onSuccess();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isSettingNew ? 'Set PIN' : 'Change PIN'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={loading}>
            {isSettingNew ? 'Set PIN' : 'Update PIN'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {error && <Alert type="error" message={error} />}
        {!isSettingNew && (
          <PinRow
            label="Current PIN"
            value={currentPin}
            onChange={setCurrentPin}
            refs={currentRefs}
            error=""
          />
        )}
        <PinRow
          label="New PIN"
          value={newPin}
          onChange={setNewPin}
          refs={newRefs}
          error=""
        />
        <PinRow
          label="Confirm New PIN"
          value={confirmPin}
          onChange={setConfirmPin}
          refs={confirmRefs}
          error=""
        />
        <p className="text-[11px] text-slate-600">
          PIN must be exactly 6 digits. It encrypts access to WorkVault on this device.
        </p>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const { hasPin, setPin, removePin, lock } = useAuth();

  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // PIN modals
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [removePinConfirm, setRemovePinConfirm] = useState(false);
  const [verifyForRemove, setVerifyForRemove] = useState<string[]>(emptyPin());
  const [verifyForRemoveOpen, setVerifyForRemoveOpen] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const verifyRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Backup/restore/export/import
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [importConfirm, setImportConfirm] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);

  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const loadDbInfo = async () => {
    setDbLoading(true);
    try {
      const res = await api().getDatabaseInfo();
      if (res.success && res.data) setDbInfo(res.data);
    } catch { /* browser / no electron */ }
    finally { setDbLoading(false); }
  };

  useEffect(() => { loadDbInfo(); }, []);

  // ── Remove PIN flow ──────────────────────────────────────────────────────────
  const handleRemovePinClick = () => {
    setVerifyForRemove(emptyPin());
    setVerifyError('');
    setVerifyForRemoveOpen(true);
    setTimeout(() => verifyRefs.current[0]?.focus(), 100);
  };

  const handleRemovePinConfirm = async () => {
    const full = verifyForRemove.join('');
    if (full.length < PIN_LENGTH) { setVerifyError('Enter your current 6-digit PIN to confirm.'); return; }
    const valid = await api().authVerifyPin(full);
    if (!valid) {
      setVerifyError('Incorrect PIN.');
      setVerifyForRemove(emptyPin());
      setTimeout(() => verifyRefs.current[0]?.focus(), 50);
      return;
    }
    await removePin();
    setVerifyForRemoveOpen(false);
    showAlert('success', 'PIN removed. WorkVault will open without a PIN until you set a new one.');
  };

  // ── Backup ──────────────────────────────────────────────────────────────────
  const handleBackup = async () => {
    setBusy('backup');
    try {
      const savePath = await api().showSaveDialog({
        title: 'Save Database Backup',
        defaultPath: `workvault-backup-${new Date().toISOString().slice(0, 10)}.db`,
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
      });
      if (!savePath?.data) { setBusy(null); return; }
      const res = await api().backupDatabase(savePath.data);
      if (res.success) showAlert('success', `Backup saved to ${savePath.data}`);
      else showAlert('error', res.error ?? 'Backup failed');
    } catch (e: any) { showAlert('error', e.message ?? 'Backup failed'); }
    setBusy(null);
  };

  const handleRestorePick = async () => {
    try {
      const openPath = await api().showOpenDialog({
        title: 'Select Backup File',
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
      });
      if (!openPath?.data) return;
      setPendingRestore(openPath.data);
      setRestoreConfirm(true);
    } catch (e: any) { showAlert('error', e.message ?? 'Could not open file dialog'); }
  };

  const handleRestoreConfirm = async () => {
    if (!pendingRestore) return;
    setBusy('restore');
    setRestoreConfirm(false);
    try {
      const res = await api().restoreDatabase(pendingRestore);
      if (res.success) {
        showAlert('success', 'Database restored. Restart the app to apply changes.');
        await loadDbInfo();
      } else {
        showAlert('error', res.error ?? 'Restore failed');
      }
    } catch (e: any) { showAlert('error', e.message ?? 'Restore failed'); }
    setBusy(null);
    setPendingRestore(null);
  };

  const handleExport = async () => {
    setBusy('export');
    try {
      const savePath = await api().showSaveDialog({
        title: 'Export Data as JSON',
        defaultPath: `workvault-export-${new Date().toISOString().slice(0, 10)}.json`,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (!savePath?.data) { setBusy(null); return; }
      const res = await api().exportToJSON(savePath.data);
      if (res.success) showAlert('success', `Data exported to ${savePath.data}`);
      else showAlert('error', res.error ?? 'Export failed');
    } catch (e: any) { showAlert('error', e.message ?? 'Export failed'); }
    setBusy(null);
  };

  const handleImportPick = async () => {
    try {
      const openPath = await api().showOpenDialog({
        title: 'Select JSON Export File',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (!openPath?.data) return;
      setPendingImport(openPath.data);
      setImportConfirm(true);
    } catch (e: any) { showAlert('error', e.message ?? 'Could not open file dialog'); }
  };

  const handleImportConfirm = async () => {
    if (!pendingImport) return;
    setBusy('import');
    setImportConfirm(false);
    try {
      const res = await api().importFromJSON(pendingImport);
      if (res.success && res.data) {
        const r = res.data as ImportResult;
        const counts = Object.entries(r.imported).map(([k, v]) => `${v} ${k}`).join(', ');
        showAlert('success', `Imported: ${counts || 'nothing'}.${r.errors.length ? ` ${r.errors.length} error(s) skipped.` : ''}`);
        await loadDbInfo();
      } else {
        showAlert('error', res.error ?? 'Import failed');
      }
    } catch (e: any) { showAlert('error', e.message ?? 'Import failed'); }
    setBusy(null);
    setPendingImport(null);
  };

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-100">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Security, database management, and data utilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alert && (
          <div className="md:col-span-2">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        {/* ── Security ──────────────────────────────────────────────────── */}
        <Section
          title="Security"
          description="Manage your PIN lock for WorkVault."
          icon={<ShieldCheck size={15} />}
        >
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <div>
              <p className="text-xs font-medium text-slate-300">PIN Lock</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {hasPin ? 'Active — app is locked on startup' : 'Not set — app opens without a PIN'}
              </p>
            </div>
            <span className={clsx(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              hasPin
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-700/50 text-slate-500 border-slate-600/30'
            )}>
              {hasPin ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              icon={<KeyRound size={13} />}
              onClick={() => setPinModalOpen(true)}
            >
              {hasPin ? 'Change PIN' : 'Set PIN'}
            </Button>

            {hasPin && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Lock size={13} />}
                  onClick={lock}
                  className="text-amber-400/80 hover:text-amber-400"
                >
                  Lock Now
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ShieldOff size={13} />}
                  onClick={handleRemovePinClick}
                  className="text-red-400/70 hover:text-red-400"
                >
                  Remove PIN
                </Button>
              </>
            )}
          </div>
        </Section>

        {/* ── Database Info ─────────────────────────────────────────────── */}
        <Section
          title="Database"
          description="Local SQLite database used to store all your data."
          icon={<Database size={15} />}
        >
          <div className="flex items-center gap-2 mb-2">
            {dbLoading ? (
              <Loader2 size={13} className="animate-spin text-slate-500" />
            ) : (
              <button
                onClick={loadDbInfo}
                className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                title="Refresh"
              >
                <RefreshCw size={12} />
              </button>
            )}
          </div>
          {dbInfo ? (
            <div>
              <InfoRow label="Location" value={dbInfo.path} />
              <InfoRow label="Size" value={dbInfo.sizeFormatted} />
              <InfoRow label="Last modified" value={formatDateTime(dbInfo.lastModified) ?? '—'} />
              <InfoRow label="Status" value={dbInfo.exists ? 'Connected' : 'Not found'} />
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Database info only available in the Electron app.
            </p>
          )}
        </Section>

        {/* ── Backup & Restore ──────────────────────────────────────────── */}
        <Section
          title="Backup & Restore"
          description="Create a binary backup of your database or restore from a previous backup."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
              onClick={handleBackup}
              loading={busy === 'backup'}
            >
              Backup Database
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload size={13} />}
              onClick={handleRestorePick}
              loading={busy === 'restore'}
            >
              Restore from Backup
            </Button>
          </div>
          <p className="text-[11px] text-slate-600">
            Restoring will overwrite the current database. A restart is required after restoring.
          </p>
        </Section>

        {/* ── Export & Import ───────────────────────────────────────────── */}
        <Section
          title="Export & Import"
          description="Export all your data as JSON for portability, or import a previously exported file."
        >
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileJson size={13} />}
              onClick={handleExport}
              loading={busy === 'export'}
            >
              Export as JSON
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<FolderOpen size={13} />}
              onClick={handleImportPick}
              loading={busy === 'import'}
            >
              Import from JSON
            </Button>
          </div>
          <p className="text-[11px] text-slate-600">
            Importing merges data into the existing database — it does not replace it.
          </p>
        </Section>

        {/* ── About ─────────────────────────────────────────────────────── */}
        <Section title="About">
          <InfoRow label="App" value="WorkVault" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Built with" value="Electron + React + SQLite" />
        </Section>
      </div>

      {/* ── Change/Set PIN Modal ─────────────────────────────────────────────── */}
      <ChangePinModal
        onPinSet={setPin}
        open={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        isSettingNew={!hasPin}
        onSuccess={() => showAlert('success', hasPin ? 'PIN updated successfully.' : 'PIN set. WorkVault is now locked on startup.')}
      />

      {/* ── Verify PIN before Remove Modal ──────────────────────────────────── */}
      <Modal
        open={verifyForRemoveOpen}
        onClose={() => setVerifyForRemoveOpen(false)}
        title="Confirm PIN Removal"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setVerifyForRemoveOpen(false)}>Cancel</Button>
            <Button variant="danger" size="sm" onClick={handleRemovePinConfirm}>Remove PIN</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-400">
            Enter your current PIN to confirm removal. The app will no longer require a PIN to open.
          </p>
          <PinRow
            label="Current PIN"
            value={verifyForRemove}
            onChange={setVerifyForRemove}
            refs={verifyRefs}
            error={verifyError}
          />
        </div>
      </Modal>

      {/* ── Restore confirm ──────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={restoreConfirm}
        onClose={() => { setRestoreConfirm(false); setPendingRestore(null); }}
        onConfirm={handleRestoreConfirm}
        title="Restore Database?"
        message="This will overwrite your current database with the selected backup. This cannot be undone."
        confirmLabel="Restore"
      />

      {/* ── Import confirm ───────────────────────────────────────────────────── */}
      <ConfirmDialog
        open={importConfirm}
        onClose={() => { setImportConfirm(false); setPendingImport(null); }}
        onConfirm={handleImportConfirm}
        title="Import JSON Data?"
        message="This will merge the selected export file into your existing database. Duplicate entries may be created."
        confirmLabel="Import"
      />
    </PageWrapper>
  );
};

export default Settings;