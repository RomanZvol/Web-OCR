import React from 'react';
import { type TextStats as TextStatsType } from '../utils/textProcessing';
import { Hash, Type, AlignLeft, MessageSquare } from 'lucide-react';

interface TextStatsProps {
  stats: TextStatsType;
}

const statItems = [
  { key: 'words' as const, label: 'Words', icon: Type },
  { key: 'characters' as const, label: 'Characters', icon: Hash },
  { key: 'lines' as const, label: 'Lines', icon: AlignLeft },
  { key: 'sentences' as const, label: 'Sentences', icon: MessageSquare },
];

export const TextStats: React.FC<TextStatsProps> = ({ stats }) => {
  return (
    <div className="text-stats-grid">
      {statItems.map(({ key, label, icon: Icon }) => (
        <div key={key} className="stat-card">
          <div className="stat-icon">
            <Icon size={16} />
          </div>
          <div className="stat-value">{stats[key]}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
};
