// src/pages/Settings.tsx
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { DatabaseInfo, ImportResult } from '@/types/electron.types';
import { formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
  AlertTriangle, CheckCircle2,
  Database, Download,
  FileJson, FolderOpen,
  Info, Loader2,
  RefreshCw,
  Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

const api = () => (window as any).electronAPI;

// ── Small section card ────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; description?: string; children: React.ReactNode }> = ({
  title, description, children,
}) => (
  <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 space-y-4">
    <div>
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
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

// ─────────────────────────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // which action is running
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
    } catch (e: any) {
      showAlert('error', e.message ?? 'Backup failed');
    }
    setBusy(null);
  };

  // ── Restore ─────────────────────────────────────────────────────────────────
  const handleRestorePick = async () => {
    try {
      const openPath = await api().showOpenDialog({
        title: 'Select Backup File',
        filters: [{ name: 'SQLite Database', extensions: ['db'] }],
      });
      if (!openPath?.data) return;
      setPendingRestore(openPath.data);
      setRestoreConfirm(true);
    } catch (e: any) {
      showAlert('error', e.message ?? 'Could not open file dialog');
    }
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
    } catch (e: any) {
      showAlert('error', e.message ?? 'Restore failed');
    }
    setBusy(null);
    setPendingRestore(null);
  };

  // ── Export JSON ─────────────────────────────────────────────────────────────
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
    } catch (e: any) {
      showAlert('error', e.message ?? 'Export failed');
    }
    setBusy(null);
  };

  // ── Import JSON ─────────────────────────────────────────────────────────────
  const handleImportPick = async () => {
    try {
      const openPath = await api().showOpenDialog({
        title: 'Select JSON Export File',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });
      if (!openPath?.data) return;
      setPendingImport(openPath.data);
      setImportConfirm(true);
    } catch (e: any) {
      showAlert('error', e.message ?? 'Could not open file dialog');
    }
  };

  const handleImportConfirm = async () => {
    if (!pendingImport) return;
    setBusy('import');
    setImportConfirm(false);
    try {
      const res = await api().importFromJSON(pendingImport);
      if (res.success && res.data) {
        const r = res.data as ImportResult;
        const counts = Object.entries(r.imported)
          .map(([k, v]) => `${v} ${k}`)
          .join(', ');
        showAlert('success', `Imported: ${counts || 'nothing'}.${r.errors.length ? ` ${r.errors.length} error(s) skipped.` : ''}`);
        await loadDbInfo();
      } else {
        showAlert('error', res.error ?? 'Import failed');
      }
    } catch (e: any) {
      showAlert('error', e.message ?? 'Import failed');
    }
    setBusy(null);
    setPendingImport(null);
  };

  return (
    <PageWrapper>
      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-100">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Database management and data utilities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alert — full width */}
        {alert && (
          <div className="md:col-span-2">
            <Alert type={alert.type} message={alert.message} />
          </div>
        )}

        {/* Database Info */}
        <Section
          title="Database"
          description="Local SQLite database used to store all your data."
        >
          <div className="flex items-center gap-2 mb-2">
            <Database size={14} className="text-slate-500" />
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

        {/* Backup & Restore */}
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

        {/* Export & Import */}
        <Section
          title="Export & Import"
          description="Export all your data as a JSON file for portability, or import a previously exported file."
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

        {/* About */}
        <Section title="About">
          <InfoRow label="App" value="WorkVault" />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Built with" value="Electron + React + SQLite" />
        </Section>
      </div>

      {/* Restore confirm */}
      <ConfirmDialog
        open={restoreConfirm}
        onClose={() => { setRestoreConfirm(false); setPendingRestore(null); }}
        onConfirm={handleRestoreConfirm}
        title="Restore Database?"
        message="This will overwrite your current database with the selected backup. This cannot be undone."
        confirmLabel="Restore"
      />

      {/* Import confirm */}
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