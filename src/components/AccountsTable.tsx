import React, { useState } from 'react';
import { AccountItem } from '../types';
import {
  Search,
  XCircle,
  Clock,
  Trash2,
  ArrowUpDown,
  Download,
  RotateCw,
  Zap,
  User,
  Phone,
  CheckSquare,
  Square,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

interface AccountsTableProps {
  accounts: AccountItem[];
  total: number;
  onRefresh: () => void;
  onDeleteAccount: (id: string) => void;
  onDeleteSelectedAccounts: (ids: string[]) => void;
  onClearAll: () => void;
  onExport: (format: 'csv' | 'json', selectedIds?: string[], excludeStatus?: string) => void;
  filterStatus: string;
  onSetFilterStatus: (status: string) => void;
  searchQuery: string;
  onSetSearchQuery: (query: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  total,
  onRefresh,
  onDeleteAccount,
  onDeleteSelectedAccounts,
  onClearAll,
  onExport,
  filterStatus,
  onSetFilterStatus,
  searchQuery,
  onSetSearchQuery,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Selected Account IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const totalPages = Math.ceil(accounts.length / pageSize) || 1;
  const paginatedAccounts = accounts.slice((page - 1) * pageSize, page * pageSize);

  // Check if all accounts in the currently filtered list are selected
  const allFilteredSelected = accounts.length > 0 && accounts.every((a) => selectedIds.has(a.id));
  const someFilteredSelected = accounts.some((a) => selectedIds.has(a.id)) && !allFilteredSelected;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      const next = new Set(selectedIds);
      accounts.forEach((a) => next.delete(a.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      accounts.forEach((a) => next.add(a.id));
      setSelectedIds(next);
    }
  };

  const selectExceptFailed = () => {
    const next = new Set<string>();
    accounts.forEach((a) => {
      if (a.status !== 'FAILED') {
        next.add(a.id);
      }
    });
    setSelectedIds(next);
  };

  const selectOnlineOrActive = () => {
    const next = new Set<string>();
    accounts.forEach((a) => {
      if (a.status === 'ONLINE' || a.accountStatus === 'Active') {
        next.add(a.id);
      }
    });
    setSelectedIds(next);
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const getStatusBadge = (status: AccountItem['status']) => {
    switch (status) {
      case 'ONLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>ONLINE</span>
          </span>
        );
      case 'OFFLINE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-500 border border-red-500/20 uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>OFFLINE</span>
          </span>
        );
      case 'CHECKING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 uppercase">
            <RotateCw className="w-3 h-3 animate-spin text-yellow-400" />
            <span>CHECKING</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>LOGIN FAILED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/5 text-white/40 border border-white/10 uppercase">
            <Clock className="w-3 h-3" />
            <span>PENDING</span>
          </span>
        );
    }
  };

  const getAccountStatusBadge = (accStatus?: AccountItem['accountStatus']) => {
    switch (accStatus) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ACTIVE</span>
          </span>
        );
      case 'Expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>EXPIRED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-white/30 bg-white/5 border border-white/10 uppercase">
            <span>--</span>
          </span>
        );
    }
  };

  const formatLastChecked = (iso: string | null) => {
    if (!iso) return '--:--:--';
    const date = new Date(iso);
    return date.toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-[#0C0C0E] border border-white/10 rounded-2xl shadow-2xl space-y-5 p-6">
      {/* Search, Filters & Export Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSetSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search account username, status or expiry..."
            className="w-full bg-white/5 border border-white/10 text-white text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-white/30"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {['ALL', 'ONLINE', 'OFFLINE', 'ACTIVE', 'EXPIRED', 'FAILED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => {
                onSetFilterStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-black uppercase rounded-lg transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-white text-black shadow-md'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Exclude Failed Export */}
          <button
            onClick={() => onExport('csv', undefined, 'FAILED')}
            className="px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs tracking-wider uppercase rounded-xl border border-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            title="Export CSV without Failed Accounts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT EXCL. FAILED</span>
          </button>

          {/* Export CSV (All / Selected) */}
          <button
            onClick={() => {
              if (selectedIds.size > 0) {
                onExport('csv', Array.from(selectedIds));
              } else {
                onExport('csv');
              }
            }}
            className="px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-extrabold text-xs tracking-wider uppercase rounded-xl border border-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
            title={selectedIds.size > 0 ? `Export CSV for ${selectedIds.size} selected accounts` : 'Export CSV for all accounts'}
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>{selectedIds.size > 0 ? `EXPORT CSV (${selectedIds.size})` : 'EXPORT ALL CSV'}</span>
          </button>

          <button
            onClick={onRefresh}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all cursor-pointer"
            title="Refresh Table"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {accounts.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear ALL accounts?')) {
                  onClearAll();
                  setSelectedIds(new Set());
                }
              }}
              className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all cursor-pointer"
              title="Clear All Accounts"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Multi-Select Action Banner (Appears when items are selected or quick selector clicked) */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAllFiltered}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-lg border border-white/10 transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4 text-blue-400" />
              <span>
                {selectedIds.size > 0 ? `${selectedIds.size} SELECTED` : 'SELECT ALL'}
              </span>
            </button>
          </div>

          {/* Quick Selection Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-white/30 uppercase tracking-wider font-bold">Quick Select:</span>
            <button
              onClick={selectExceptFailed}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/20 transition-all cursor-pointer"
              title="Select all accounts except login failed"
            >
              Except Failed
            </button>
            <button
              onClick={selectOnlineOrActive}
              className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-bold rounded-lg border border-blue-500/20 transition-all cursor-pointer"
              title="Select Online or Active accounts"
            >
              Online / Active
            </button>
            <button
              onClick={toggleSelectAllFiltered}
              className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/70 font-bold rounded-lg border border-white/10 transition-all cursor-pointer"
            >
              All Filtered ({accounts.length})
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white font-bold rounded-lg border border-white/10 transition-all cursor-pointer flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Clear Selection</span>
              </button>
            )}
          </div>
        </div>

        {/* Selected Batch Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onExport('csv', Array.from(selectedIds))}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT SELECTED CSV ({selectedIds.size})</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected account(s)?`)) {
                  onDeleteSelectedAccounts(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>DELETE SELECTED ({selectedIds.size})</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/20">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] text-white/40 text-[10px] font-black tracking-widest uppercase border-b border-white/10">
              <th className="py-3.5 px-4 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected && accounts.length > 0}
                  onChange={toggleSelectAllFiltered}
                  className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-500"
                  title={allFilteredSelected ? 'Deselect All' : 'Select All Filtered'}
                />
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('username')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>LOGIN ID</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('customerName')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>USER NAME</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('mobile')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>MOBILE NO.</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('status')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>CONNECTION STATUS</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('accountStatus')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>ACCOUNT STATUS</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('expiryDate')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>EXPIRY DATE</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('lastChecked')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>LAST CHECKED</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">
                <button
                  onClick={() => onSort('responseTimeMs')}
                  className="flex items-center gap-1.5 hover:text-white cursor-pointer"
                >
                  <span>RESPONSE TIME</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3.5 px-5 font-black">ERROR LOG</th>
              <th className="py-3.5 px-5 font-black text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs font-mono">
            {paginatedAccounts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-white/30">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Zap className="w-8 h-8 text-white/20" />
                    <p className="font-bold text-white/60 uppercase">No accounts found</p>
                    <p className="text-[11px] text-white/30">
                      Import CSV/TXT or add accounts manually to begin connection checking.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAccounts.map((account) => {
                const isSelected = selectedIds.has(account.id);
                return (
                  <tr
                    key={account.id}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-500/10 border-l-2 border-blue-500 hover:bg-blue-500/15'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(account.id)}
                        className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-500"
                      />
                    </td>
                    <td className="py-3.5 px-5 font-bold text-white font-mono">{account.username}</td>
                    <td className="py-3.5 px-5 font-bold text-emerald-300">
                      {account.customerName ? (
                        <span className="inline-flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{account.customerName}</span>
                        </span>
                      ) : (
                        <span className="text-white/20">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-sky-300">
                      {account.mobile ? (
                        <span className="inline-flex items-center gap-1.5 font-mono">
                          <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{account.mobile}</span>
                        </span>
                      ) : (
                        <span className="text-white/20">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">{getStatusBadge(account.status)}</td>
                    <td className="py-3.5 px-5">{getAccountStatusBadge(account.accountStatus)}</td>
                    <td className="py-3.5 px-5 text-amber-300 font-bold">
                      {account.expiryDate || <span className="text-white/20">--</span>}
                    </td>
                    <td className="py-3.5 px-5 text-white/40">
                      {formatLastChecked(account.lastChecked)}
                    </td>
                    <td className="py-3.5 px-5 text-blue-400 font-bold">
                      {account.responseTimeMs ? `${account.responseTimeMs} ms` : '--'}
                    </td>
                    <td className="py-3.5 px-5 text-red-400 max-w-xs truncate" title={account.error || ''}>
                      {account.error || <span className="text-white/20">None</span>}
                    </td>
                    <td className="py-3.5 px-5 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={async () => {
                          try {
                            await fetch('/api/accounts/check-single', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ username: account.username }),
                            });
                            onRefresh();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="p-1.5 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Re-check Account"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteAccount(account.id)}
                        className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-white/40 font-mono pt-2">
        <span>
          SHOWING {accounts.length > 0 ? (page - 1) * pageSize + 1 : 0} TO{' '}
          {Math.min(page * pageSize, accounts.length)} OF {accounts.length} ACCOUNTS
        </span>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold rounded-lg border border-white/10 cursor-pointer uppercase"
          >
            PREV
          </button>
          <span className="font-bold text-white">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-bold rounded-lg border border-white/10 cursor-pointer uppercase"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};
