// src/components/dbconnections/DbConnectionTable.tsx

import { useClipboard } from '@/hooks/useClipboard';
import type { DbConnection } from '@/types/dbconnection.types';
import { formatRelativeTime, maskPassword } from '@/utils/formatters';
import { clsx } from 'clsx';
import {
  Check, Copy,
  Database,
  Eye, EyeOff,
  Layers,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';

interface DbConnectionTableProps {
  connections: DbConnection[];
  onEdit: (c: DbConnection) => void;
  onDelete: (c: DbConnection) => void;
  onToggleFavorite: (id: number) => void;
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  direct: { label: 'Direct', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  tns:    { label: 'TNS',    color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  ldap:   { label: 'LDAP',   color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
};

export const DbConnectionTable: React.FC<DbConnectionTableProps> = ({
  connections, onEdit, onDelete, onToggleFavorite,
}) => (
  <div className="card overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700/60 bg-slate-900/40">
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3 w-8" />
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Name</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Type</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">User / Schema</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Password</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Host / Service</th>
            <th className="text-left font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Updated</th>
            <th className="text-right font-medium text-slate-400 text-xs uppercase tracking-wide px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {connections.map((c) => (
            <DbConnectionTableRow
              key={c.id}
              connection={c}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

interface RowProps {
  connection: DbConnection;
  onEdit: (c: DbConnection) => void;
  onDelete: (c: DbConnection) => void;
  onToggleFavorite: (id: number) => void;
}

const DbConnectionTableRow: React.FC<RowProps> = ({
  connection, onEdit, onDelete, onToggleFavorite,
}) => {
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { copy, copySequential } = useClipboard();

  const handleCopy = async (value: string | null, field: string) => {
    if (!value) return;
    await copy(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleCopyAll = async () => {
    const fields = [
      connection.service_name ? { value: connection.service_name, label: 'Service copied' } : null,
      connection.host         ? { value: connection.host,         label: 'Host copied' }    : null,
      connection.user_schema  ? { value: connection.user_schema,  label: 'Username copied' } : null,
    ].filter(Boolean) as { value: string; label: string }[];
    if (fields.length === 0) return;
    await copySequential(fields, 1000);
  };

  const badge = TYPE_BADGE[connection.type] ?? TYPE_BADGE.direct;

  // Host / service display
  const hostService = connection.type === 'tns'
    ? connection.tns_alias
    : connection.host
      ? `${connection.host}${connection.port ? `:${connection.port}` : ''}${connection.service_name ? ` / ${connection.service_name}` : ''}`
      : connection.service_name ?? null;

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
      {/* Favorite */}
      <td className="px-4 py-3">
        <button
          onClick={() => onToggleFavorite(connection.id)}
          className="text-slate-500 hover:text-yellow-400 transition-colors"
        >
          <Star size={14} className={clsx(connection.is_favorite && 'fill-yellow-400 text-yellow-400')} />
        </button>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Database size={13} className="text-blue-400" />
          </div>
          <p className="text-slate-100 font-medium truncate max-w-[160px]">{connection.name}</p>
        </div>
      </td>

      {/* Type badge */}
      <td className="px-4 py-3">
        <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', badge.color)}>
          {badge.label}
        </span>
      </td>

      {/* User / Schema */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-300 font-mono truncate max-w-[140px]">
            {connection.user_schema || <span className="text-slate-600 italic">—</span>}
          </span>
          {connection.user_schema && (
            <button
              onClick={() => handleCopy(connection.user_schema, 'user')}
              className="text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0"
            >
              {copied === 'user' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          )}
        </div>
      </td>

      {/* Password */}
      <td className="px-4 py-3">
        {connection.password ? (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-300 font-mono text-xs tracking-wide">
              {showPwd ? connection.password : maskPassword(connection.password)}
            </span>
            <button onClick={() => setShowPwd((v) => !v)} className="text-slate-500 hover:text-slate-200 transition-colors">
              {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button
              onClick={() => handleCopy(connection.password, 'password')}
              className="text-slate-500 hover:text-slate-200 transition-colors"
            >
              {copied === 'password' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          </div>
        ) : (
          <span className="text-slate-600 italic text-xs">—</span>
        )}
      </td>

      {/* Host / Service */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]">
            {hostService ?? <span className="text-slate-600 italic">—</span>}
          </span>
          {hostService && (
            <button
              onClick={() => handleCopy(hostService, 'host')}
              className="text-slate-500 hover:text-slate-200 transition-colors flex-shrink-0"
            >
              {copied === 'host' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </button>
          )}
        </div>
      </td>

      {/* Updated */}
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
        {formatRelativeTime(connection.updated_at)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={handleCopyAll}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/60 rounded-lg transition-colors"
            title="Copy service, host & username sequentially"
          >
            <Layers size={13} />
          </button>
          <button
            onClick={() => onEdit(connection)}
            className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(connection)}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
};
