// src/pages/Tools.tsx
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Base64Tool } from '@/components/tools/Base64Tool';
import { ColorPicker } from '@/components/tools/ColorPicker';
import { DiffChecker } from '@/components/tools/DiffChecker';
import { JwtDecoder } from '@/components/tools/JwtDecoder';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { PasswordGenerator } from '@/components/tools/PasswordGenerator';
import { UuidGenerator } from '@/components/tools/UuidGenerator';
import { clsx } from 'clsx';
import { Binary, Braces, GitCompare, Hash, KeyRound, Palette, ShieldCheck, Wrench } from 'lucide-react';
import React, { useState } from 'react';

interface Tool {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  description: string;
}

const TOOLS: Tool[] = [
  {
    id: 'json',
    label: 'JSON Formatter',
    icon: <Braces size={16} />,
    description: 'Format and minify JSON',
    component: <JsonFormatter />,
  },
  {
    id: 'diff',
    label: 'Diff Checker',
    icon: <GitCompare size={16} />,
    description: 'Compare two blocks of text',
    component: <DiffChecker />,
  },
  {
    id: 'jwt',
    label: 'JWT Decoder',
    icon: <KeyRound size={16} />,
    description: 'Decode & inspect JWT tokens',
    component: <JwtDecoder />,
  },
  {
    id: 'color',
    label: 'Color Picker',
    icon: <Palette size={16} />,
    description: 'Pick, convert & explore colors',
    component: <ColorPicker />,
  },
  {
    id: 'password',
    label: 'Password Generator',
    icon: <ShieldCheck size={16} />,
    description: 'Generate secure random passwords',
    component: <PasswordGenerator />,
  },
  {
    id: 'uuid',
    label: 'UUID Generator',
    icon: <Hash size={16} />,
    description: 'Generate v4 UUIDs',
    component: <UuidGenerator />,
  },
  {
    id: 'base64',
    label: 'Base64',
    icon: <Binary size={16} />,
    description: 'Encode and decode Base64',
    component: <Base64Tool />,
  },
];

const Tools: React.FC = () => {
  const [active, setActive] = useState(TOOLS[0].id);
  const current = TOOLS.find((t) => t.id === active)!;

  const header = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
        <Wrench size={16} className="text-violet-400" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-slate-100">Tools</h2>
        <p className="text-xs text-slate-500">Developer utilities</p>
      </div>
    </div>
  );

  return (
    <PageWrapper header={header}>
      <div className="flex gap-5 h-full">
        {/* Sidebar nav */}
        <nav className="w-48 flex-shrink-0 space-y-1">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActive(tool.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                active === tool.id
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              )}
            >
              <span className={active === tool.id ? 'text-violet-400' : 'text-slate-500'}>
                {tool.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{tool.label}</p>
                <p className="text-[10px] text-slate-500 truncate">{tool.description}</p>
              </div>
            </button>
          ))}
        </nav>

        {/* Tool panel */}
        <div className="flex-1 min-w-0 bg-slate-800/60 border border-slate-700 rounded-2xl p-5 overflow-hidden flex flex-col">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 flex-shrink-0">{current.label}</h2>
          <div className="flex-1 min-h-0">{current.component}</div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Tools;
