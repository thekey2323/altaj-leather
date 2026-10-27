'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { DateRangeFilter, DateRangePreset } from '@/types/altaj';

interface DateRangePickerProps {
  filter: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
}

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'last_7_days', label: 'Last 7 days' },
  { id: 'this_month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'this_year', label: 'This year' },
  { id: 'all_time', label: 'All time' },
  { id: 'custom', label: 'Custom period' },
];

export function DateRangePicker({ filter, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(filter.startDate);
  const [customEnd, setCustomEnd] = useState(filter.endDate);

  const currentLabel = PRESETS.find((p) => p.id === filter.preset)?.label || 'Period';

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      onChange({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
    } else {
      const now = new Date();
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      let s = '';
      let e = formatYMD(now);

      if (preset === 'today') {
        s = e;
      } else if (preset === 'last_7_days') {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        s = formatYMD(d);
      } else if (preset === 'this_month') {
        s = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      } else if (preset === 'last_month') {
        const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        s = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
        const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
        e = formatYMD(lastDay);
      } else if (preset === 'this_year') {
        s = `${now.getFullYear()}-01-01`;
      } else if (preset === 'all_time') {
        s = '2020-01-01';
        e = '2099-12-31';
      }

      onChange({
        preset,
        startDate: s,
        endDate: e,
      });
      setIsOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onChange({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-charcoal-800 bg-white hover:bg-cream-100 border border-cream-300 rounded-xl shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sage-400"
      >
        <Calendar className="w-4 h-4 text-sage-500" />
        <span className="font-medium text-xs md:text-sm">{currentLabel}</span>
        <ChevronDown className="w-3.5 h-3.5 text-charcoal-500 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-card border border-cream-300 z-50 p-2 animate-fade-in">
            <div className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 px-3 py-1.5">
              Select date period
            </div>
            <div className="space-y-0.5">
              {PRESETS.map((p) => {
                const isSelected = filter.preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs md:text-sm rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-sage-100 text-sage-700 font-medium'
                        : 'text-charcoal-800 hover:bg-cream-100'
                    }`}
                  >
                    <span>{p.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-sage-600" />}
                  </button>
                );
              })}
            </div>

            {filter.preset === 'custom' && (
              <div className="mt-3 pt-3 border-t border-cream-200 px-2 space-y-2">
                <div className="text-xs text-charcoal-500 font-medium">Custom range:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-charcoal-500 uppercase">From</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full text-xs p-1.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-sage-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-charcoal-500 uppercase">To</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full text-xs p-1.5 border border-cream-300 rounded-lg focus:ring-1 focus:ring-sage-400 outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="w-full mt-2 py-1.5 bg-sage-500 hover:bg-sage-600 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Apply Date Range
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
