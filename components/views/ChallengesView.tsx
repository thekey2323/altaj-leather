'use client';

import React, { useState } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  Trophy,
  CheckCircle2,
  Circle,
  Camera,
  Award,
  Sparkles,
  Calendar,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ChallengesView() {
  const { challenges, toggleChallengeTask, isRtl } = useHeiba();
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);

  const activeChallenge = challenges[activeChallengeIndex] || challenges[0];

  const handleToggleTask = (day: number) => {
    toggleChallengeTask(activeChallenge.id, day);

    // If completing the task
    const task = activeChallenge.dailyTasks.find((t) => t.day === day);
    if (task && !task.completed) {
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe
      }
    }
  };

  const completedCount = activeChallenge.dailyTasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / activeChallenge.daysCount) * 100);

  return (
    <div className="min-h-screen bg-heiba-bg p-4 pb-28 max-w-md mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-black text-heiba-text flex items-center gap-2">
          <span>{isRtl ? 'تحديات الأناقة الأسبوعية' : 'Weekly Style Challenges'}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
        </h1>
        <p className="text-xs text-heiba-secondary">
          {isRtl
            ? 'عوائد وتجارب عملية لبناء حضور قوي وإتقان التنسيق اليومي'
            : 'Structured habit-building missions to master effortless styling'}
        </p>
      </div>

      {/* Challenge Selector Tabs */}
      <div className="flex gap-2">
        {challenges.map((c, idx) => (
          <button
            key={c.id}
            onClick={() => setActiveChallengeIndex(idx)}
            className={`flex-1 p-3 rounded-2xl border text-xs font-bold transition-all text-left ${
              activeChallengeIndex === idx
                ? 'border-heiba-accent bg-heiba-accentLight text-heiba-accent shadow-soft'
                : 'border-heiba-border bg-white text-heiba-text hover:border-heiba-borderHover'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase text-heiba-secondary">
                {isRtl ? `تحدي ${c.daysCount} أيام` : `${c.daysCount}-Day Challenge`}
              </span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="truncate">{isRtl ? c.titleAr : c.title}</div>
          </button>
        ))}
      </div>

      {/* Main Challenge Progress Card */}
      <div className="bg-white rounded-3xl p-5 border border-heiba-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {activeChallenge.difficulty.toUpperCase()}
            </span>
            <h2 className="font-black text-base text-heiba-text mt-1.5">
              {isRtl ? activeChallenge.titleAr : activeChallenge.title}
            </h2>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-heiba-peach text-amber-800 flex items-center justify-center shadow-soft">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <p className="text-xs text-heiba-secondary leading-relaxed">
          {isRtl ? activeChallenge.descriptionAr : activeChallenge.description}
        </p>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-heiba-secondary">
              {isRtl ? 'التقدم الحالي' : 'Progress'}
            </span>
            <span className="text-heiba-text">
              {completedCount} / {activeChallenge.daysCount} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-heiba-bg overflow-hidden border border-heiba-border">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Badge Reward Pill */}
        <div className="p-3 rounded-2xl bg-heiba-lavender/60 border border-heiba-lavenderDark flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-purple-700 flex items-center justify-center shadow-soft shrink-0">
            <Trophy className="w-5 h-5 text-heiba-accent" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-heiba-secondary block">
              {isRtl ? 'وسام الإنجاز عند الإتمام:' : 'Completion Badge:'}
            </span>
            <span className="font-extrabold text-xs text-purple-900">
              {isRtl ? activeChallenge.badgeNameAr : activeChallenge.badgeName}
            </span>
          </div>
        </div>
      </div>

      {/* Daily Tasks Checklist */}
      <div className="space-y-2.5">
        <h3 className="font-extrabold text-xs text-heiba-text uppercase tracking-wider">
          {isRtl ? 'مهام التحدي اليومية' : 'Daily Challenge Tasks'}
        </h3>

        {activeChallenge.dailyTasks.map((task) => (
          <div
            key={task.day}
            onClick={() => handleToggleTask(task.day)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              task.completed
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-white border border-heiba-border hover:border-heiba-borderHover text-heiba-text shadow-soft'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              ) : (
                <Circle className="w-5 h-5 text-heiba-secondary" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold uppercase text-heiba-secondary">
                  {isRtl ? `اليوم 0${task.day}` : `Day 0${task.day}`}
                </span>
                {task.completed && (
                  <span className="text-[10px] font-bold text-emerald-700">
                    {isRtl ? 'تم الإنجاز ✓' : 'Done ✓'}
                  </span>
                )}
              </div>
              <p
                className={`text-xs leading-snug ${
                  task.completed ? 'line-through opacity-80' : 'font-medium'
                }`}
              >
                {isRtl ? task.taskAr : task.task}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
