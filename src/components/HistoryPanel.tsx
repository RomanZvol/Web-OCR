import React, { useState, useEffect, useCallback } from 'react';
import {
  getHistory,
  deleteFromHistory,
  clearHistory,
  searchHistory,
  formatTimestamp,
  type HistoryEntry,
} from '../utils/historyManager';
import { Clock, Trash2, Search, X, FileText, ChevronRight } from 'lucide-react';

interface HistoryPanelProps {
  onSelectEntry: (entry: HistoryEntry) => void;
  refreshTrigger?: number;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ onSelectEntry, refreshTrigger }) => {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const loadHistory = useCallback(() => {
    const data = searchQuery ? searchHistory(searchQuery) : getHistory();
    setEntries(data);
  }, [searchQuery]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshTrigger]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteFromHistory(id);
    loadHistory();
  };

  const handleClear = () => {
    clearHistory();
    setEntries([]);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="history-toggle-btn"
      >
        <Clock size={16} />
        <span>History</span>
        {entries.length > 0 && (
          <span className="history-badge">{entries.length}</span>
        )}
        <ChevronRight size={14} />
      </button>
    );
  }

  return (
    <div className="history-panel animate-fade-in">
      <div className="history-header">
        <h4 className="history-title">
          <Clock size={16} color="var(--primary)" />
          Recognition History
        </h4>
        <button
          onClick={() => setIsExpanded(false)}
          className="btn-icon"
          title="Collapse"
        >
          <X size={16} />
        </button>
      </div>

      <div className="history-search">
        <Search size={14} className="history-search-icon" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="history-search-input"
        />
      </div>

      {entries.length === 0 ? (
        <div className="history-empty">
          <FileText size={32} style={{ opacity: 0.15 }} />
          <p>{searchQuery ? 'No results found' : 'No history yet'}</p>
        </div>
      ) : (
        <>
          <div className="history-list">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="history-item"
                onClick={() => onSelectEntry(entry)}
              >
                <div className="history-item-header">
                  <span className="history-item-name" title={entry.fileName}>
                    {entry.fileName}
                  </span>
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                    className="btn-icon btn-icon-danger"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="history-item-preview">{entry.preview}</p>
                <span className="history-item-time">
                  {formatTimestamp(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
          <button onClick={handleClear} className="history-clear-btn">
            <Trash2 size={14} />
            Clear All
          </button>
        </>
      )}
    </div>
  );
};
