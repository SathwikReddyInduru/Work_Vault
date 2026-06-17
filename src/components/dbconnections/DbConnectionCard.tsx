// src/components/dbconnections/DbConnectionCard.tsx

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Database, Eye, EyeOff, Copy, Check, Star, Pencil, Trash2, Server, Hash } from 'lucide-react';
import type { DbConnection } from '@/types/dbconnection.types';
import { useClipboard } from '@/hooks/useClipboard';

interface DbConnectionCardProps {
  connection: DbConnection;
  onEdit: (c: DbConnection) => void;
  onDelete: (c: DbConnection) => void;
  onToggleFavorite: (id: number) => void;
}

const TYPE_BADGE: Record<string, { label: string; color: string }> = {
  direct: { label: 'Direct', color: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  tns:    { label: 'TNS',    color: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  ldap:   { label: 'LDAP',   color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
};

export const DbConnectionCard: React.FC<DbConnectionCardProps> = ({
  connection, onEdit, onDelete, onToggleFavorite,
}) => {
  const { copy } = useClipboard();
  const [showPwd, setShowPwd] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (value: string | null, field: string) => {
    if (!value) return;
    await copy(value);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const badge = TYPE_BADGE[connection.type] ?? TYPE_BADGE.direct;

  const CopyBtn = ({ value, field }: { value: string | null; field: string }) =>
    value ? (
      <button
        onClick={() => handleCopy(value, field)}
        className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
        title={`Copy ${field}`}
      >
        {copied === field ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
      </button>
    ) : null;

  return (
    <div className={clsx(
      'group bg-slate-800/50 border rounded-2xl p-4 hover:border-slate-600 transition-all duration-150 space-y-3',
      connection.is_favorite ? 'border-amber-500/30' : 'border-slate-700'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Database size={16} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{connection.name}</p>
            <span className={clsx('text-[10px] font-medium px-1.5 py-0.5 rounded-full border', badge.color)}>
              {badge.label}
            </span>
          </div>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={() => onToggleFavorite(connection.id)}
            className={clsx('p-1.5 rounded-lg transition-colors hover:bg-slate-700',
              connection.is_favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
            )}
            title="Toggle favorite"
          >
            <Star size={13} className={connection.is_favorite ? 'fill-amber-400' : ''} />
          </button>
          <button onClick={() => onEdit(connection)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors" title="Edit">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(connection)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-2 text-xs">
        {/* User / Schema */}
        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-slate-500 flex-shrink-0">User</span>
            <span className="font-mono text-slate-300 truncate">{connection.user_schema}</span>
          </div>
          <CopyBtn value={connection.user_schema} field="user" />
        </div>

        {/* Password */}
        {connection.password && (
          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-slate-500 flex-shrink-0">Password</span>
              <span className="font-mono text-slate-300 truncate">
                {showPwd ? connection.password : '••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setShowPwd((v) => !v)} className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors">
                {showPwd ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
              <CopyBtn value={connection.password} field="password" />
            </div>
          </div>
        )}

        {/* Host + Port */}
        {(connection.host || connection.port) && (
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
            <Server size={11} className="text-slate-500 flex-shrink-0" />
            <span className="font-mono text-slate-300 truncate">
              {[connection.host, connection.port].filter(Boolean).join(':')}
            </span>
            <CopyBtn value={[connection.host, connection.port].filter(Boolean).join(':')} field="host" />
          </div>
        )}

        {/* Service Name */}
        {connection.service_name && (
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
            <Hash size={11} className="text-slate-500 flex-shrink-0" />
            <span className="text-slate-500 flex-shrink-0">Service</span>
            <span className="font-mono text-slate-300 truncate">{connection.service_name}</span>
            <CopyBtn value={connection.service_name} field="service" />
          </div>
        )}

        {/* TNS alias */}
        {connection.tns_alias && (
          <div className="flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-2">
            <span className="text-slate-500 flex-shrink-0">TNS</span>
            <span className="font-mono text-slate-300 truncate">{connection.tns_alias}</span>
            <CopyBtn value={connection.tns_alias} field="tns" />
          </div>
        )}

        {/* Notes */}
        {connection.notes && (
          <p className="text-slate-500 text-[11px] px-1 line-clamp-2">{connection.notes}</p>
        )}
      </div>
    </div>
  );
};