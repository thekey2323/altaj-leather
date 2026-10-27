'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useHeiba } from '@/context/HeibaContext';
import {
  Send,
  Sparkles,
  Paperclip,
  Heart,
  Check,
  RotateCcw,
  Mic,
  Camera,
  Layers,
  ArrowRight,
  ArrowLeft,
  Crown,
  Eye,
  X,
  Wand2,
} from 'lucide-react';
import { Outfit } from '@/types/heiba';

export function StylistChatView() {
  const {
    chatMessages,
    sendChatMessage,
    isChatLoading,
    saveOutfit,
    isOutfitSaved,
    isRtl,
    t,
    user,
    setShowUpgradeModal,
  } = useHeiba();

  const [inputText, setInputText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [isGeneratingImageForOutfit, setIsGeneratingImageForOutfit] = useState<string | null>(null);
  const [, forceUpdate] = useState({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedPhoto) return;

    // Check free query limit
    if (!user.isPro && user.aiQueriesUsedToday >= user.aiQueriesLimit) {
      setShowUpgradeModal(true);
      return;
    }

    const textToSend = inputText;
    const photoToSend = selectedPhoto || undefined;

    setInputText('');
    setSelectedPhoto(null);
    await sendChatMessage(textToSend, photoToSend);
  };

  const handleQuickChip = (suggestion: string) => {
    setInputText(suggestion);
  };

  // Re-generate or enhance look image
  const handleGenerateLookImage = async (outfit: Outfit) => {
    setIsGeneratingImageForOutfit(outfit.id);
    try {
      const res = await fetch('/api/ai/generate-look-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outfitTitle: outfit.title,
          pieces: outfit.pieces,
          colors: outfit.colorPalette.map((c) => c.name),
          occasion: outfit.occasion,
          style: outfit.style,
          customPrompt: outfit.imagePrompt,
          seed: Math.floor(Math.random() * 900000) + 100000,
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        outfit.imageUrl = data.imageUrl;
        // Trigger React re-render of the message
        forceUpdate({});
      }
    } catch (e) {
      console.warn('Image generation error:', e);
    } finally {
      setIsGeneratingImageForOutfit(null);
    }
  };

  return (
    <div className="min-h-screen bg-heiba-bg flex flex-col pb-24 max-w-md mx-auto">
      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-float border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative h-96 w-full bg-black">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-white">
              <span className="text-[10px] font-bold text-heiba-accent uppercase tracking-wider block mb-1">
                {isRtl ? 'صورة اللوك المصممة بالذكاء الاصطناعي' : 'AI Generated Look'}
              </span>
              <h4 className="font-extrabold text-sm text-heiba-text">
                {lightboxImage.title}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Chat Top Banner */}
      <div className="bg-white/95 backdrop-blur-md border-b border-heiba-border p-3.5 sticky top-16 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-heiba-lavender text-purple-700 flex items-center justify-center shadow-soft">
            <Sparkles className="w-5 h-5 text-heiba-accent" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-heiba-text flex items-center gap-1.5">
              <span>{t.chat.title}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-[10px] text-heiba-secondary">
              {t.chat.subtitle}
            </p>
          </div>
        </div>

        {/* Query Counter for Free Users */}
        {!user.isPro ? (
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-1"
          >
            <Crown className="w-3 h-3 text-amber-600" />
            <span>
              {user.aiQueriesLimit - user.aiQueriesUsedToday} {isRtl ? 'متبقية اليوم' : 'left today'}
            </span>
          </button>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
            <Crown className="w-3 h-3 text-purple-700" />
            <span>PRO</span>
          </span>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[88%] rounded-3xl p-4 shadow-soft text-xs leading-relaxed ${
                  isUser
                    ? 'bg-heiba-text text-white rounded-br-none'
                    : 'bg-white border border-heiba-border text-heiba-text rounded-bl-none'
                }`}
              >
                {/* Uploaded photo thumbnail */}
                {msg.imageUrl && (
                  <div className="rounded-2xl overflow-hidden mb-2 max-h-48 border border-white/20">
                    <img src={msg.imageUrl} alt="Uploaded attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="whitespace-pre-line">
                  {isRtl ? msg.textAr || msg.text : msg.text}
                </p>

                {/* Rich Outfit Card with GENERATED IMAGE inside response */}
                {msg.outfitCard && (
                  <div className="mt-3.5 bg-heiba-bg rounded-2xl p-3 border border-heiba-border text-heiba-text space-y-3">
                    {/* Occasion & Swatches Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-heiba-blue text-blue-800">
                        {t.occasions[msg.outfitCard.occasion] || 'Smart Casual'}
                      </span>
                      <div className="flex items-center gap-1">
                        {msg.outfitCard.colorPalette.map((cp, idx) => (
                          <span
                            key={idx}
                            className="w-3.5 h-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: cp.hex }}
                            title={cp.name}
                          ></span>
                        ))}
                      </div>
                    </div>

                    {/* Outfit Name */}
                    <h4 className="font-extrabold text-xs text-heiba-text">
                      {isRtl ? msg.outfitCard.titleAr : msg.outfitCard.title}
                    </h4>

                    {/* ONLY ONE SINGLE GENERATED OUTFIT IMAGE BASED ON RECOMMENDATION */}
                    <div className="relative rounded-2xl overflow-hidden h-60 bg-stone-200 border border-heiba-border group shadow-soft">
                      <img
                        src={
                          msg.outfitCard.imageUrl ||
                          'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85'
                        }
                        alt={msg.outfitCard.title}
                        className="w-full h-full object-cover object-top cursor-pointer group-hover:scale-103 transition-transform duration-300"
                        onClick={() =>
                          setLightboxImage({
                            url:
                              msg.outfitCard!.imageUrl ||
                              'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85',
                            title: isRtl ? msg.outfitCard!.titleAr : msg.outfitCard!.title,
                          })
                        }
                      />

                      {/* AI Generated Look Badge Overlay */}
                      <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-soft text-[10px] font-bold text-heiba-text flex items-center gap-1.5 border border-heiba-border">
                        <Sparkles className="w-3.5 h-3.5 text-heiba-accent" />
                        <span>{isRtl ? 'صورة اللوك بالذكاء الاصطناعي ✨' : 'AI Generated Look ✨'}</span>
                      </div>

                      {/* Expand / View Fullscreen Overlay */}
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxImage({
                            url:
                              msg.outfitCard!.imageUrl ||
                              'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85',
                            title: isRtl ? msg.outfitCard!.titleAr : msg.outfitCard!.title,
                          })
                        }
                        className="absolute bottom-2.5 left-2.5 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
                        title="Expand Image"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Re-generate Look Image Button */}
                    <button
                      type="button"
                      onClick={() => handleGenerateLookImage(msg.outfitCard!)}
                      disabled={isGeneratingImageForOutfit === msg.outfitCard.id}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-heiba-border hover:border-heiba-accent text-[11px] font-bold text-heiba-text flex items-center justify-center gap-1.5 transition-colors shadow-soft"
                    >
                      <Wand2
                        className={`w-3.5 h-3.5 text-heiba-accent ${
                          isGeneratingImageForOutfit === msg.outfitCard.id ? 'animate-spin' : ''
                        }`}
                      />
                      <span>
                        {isGeneratingImageForOutfit === msg.outfitCard.id
                          ? isRtl
                            ? 'جاري توليد صورة الإطلالة بألوان القطع...'
                            : 'Synthesizing Look with Exact Colors...'
                          : isRtl
                          ? 'إعادة توليد صورة اللوك بألوان القطع ✨'
                          : 'Re-generate Look Image with Exact Colors ✨'}
                      </span>
                    </button>

                    {/* Exact Coordinated Colors Palette */}
                    <div className="bg-white p-3 rounded-2xl border border-heiba-border">
                      <span className="text-[10px] font-bold text-heiba-secondary uppercase tracking-wider block mb-2">
                        {isRtl ? 'الألوان المنسقة في هذا اللوك:' : 'Exact Look Colors & Palette:'}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        {msg.outfitCard.colorPalette.map((cp, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-heiba-bg border border-heiba-border text-xs font-bold text-heiba-text shadow-soft"
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-sm"
                              style={{ backgroundColor: cp.hex }}
                            ></span>
                            <span>{cp.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Curated Pieces List (Clean Text Chips with Exact Colors, No Extra Images) */}
                    <div className="bg-white p-3 rounded-2xl border border-heiba-border space-y-2">
                      <span className="text-[10px] font-bold text-heiba-secondary uppercase tracking-wider block">
                        {isRtl ? 'القطع المنسقة في الصورة أعلاه:' : 'Pieces Featured in Look Image:'}
                      </span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.outfitCard.pieces.map((piece, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center justify-between p-2 rounded-xl bg-heiba-bg border border-heiba-border/70 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: piece.colorHex }}
                              ></span>
                              <span className="font-bold text-heiba-text truncate">
                                {isRtl ? piece.nameAr : piece.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-medium text-heiba-secondary">
                                {piece.color}
                              </span>
                              {piece.itemRefId ? (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                                  {isRtl ? 'من خزانتك' : 'Owned'}
                                </span>
                              ) : (
                                <span className="text-[9px] font-medium text-heiba-secondary bg-stone-200/60 px-1.5 py-0.5 rounded-md">
                                  {isRtl ? 'مقترحة' : 'Suggested'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>



                    {/* Why it works */}
                    <div className="text-[11px] text-heiba-secondary bg-white p-2.5 rounded-xl border border-heiba-border leading-snug">
                      <strong className="text-heiba-text block mb-0.5">
                        {isRtl ? 'لماذا هذا التنسيق ناجح؟' : 'Why it works:'}
                      </strong>
                      {isRtl ? msg.outfitCard.whyItWorksAr : msg.outfitCard.whyItWorks}
                    </div>

                    {/* Styling Tips */}
                    {msg.outfitCard.stylingTips && (
                      <div className="text-[10px] text-heiba-secondary space-y-1">
                        {(isRtl
                          ? msg.outfitCard.stylingTipsAr
                          : msg.outfitCard.stylingTips
                        )?.map((tip, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-heiba-accent shrink-0"></span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Save outfit action */}
                    <button
                      onClick={() => saveOutfit(msg.outfitCard!)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isOutfitSaved(msg.outfitCard.id)
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-heiba-text text-white hover:bg-heiba-accent shadow-soft'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isOutfitSaved(msg.outfitCard.id) ? 'fill-rose-600' : ''
                        }`}
                      />
                      <span>
                        {isOutfitSaved(msg.outfitCard.id)
                          ? t.chat.outfitSaved
                          : t.chat.saveOutfit}
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-heiba-secondary mt-1 px-2">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isChatLoading && (
          <div className="flex items-center gap-2 text-xs text-heiba-secondary animate-fade-in p-2">
            <div className="w-7 h-7 rounded-xl bg-heiba-lavender text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin text-heiba-accent" />
            </div>
            <span>{t.chat.generatingResponse}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips Horizontal Bar */}
      <div className="px-4 py-2 overflow-x-auto no-scrollbar flex items-center gap-2">
        {t.chat.suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickChip(suggestion)}
            className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-2xl bg-white border border-heiba-border text-heiba-text hover:border-heiba-accent hover:bg-heiba-accentLight/40 transition-all shadow-soft"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box Bottom Bar */}
      <div className="p-3 bg-white border-t border-heiba-border sticky bottom-18">
        {/* Preview attached photo */}
        {selectedPhoto && (
          <div className="relative inline-block mb-2 rounded-xl overflow-hidden border border-heiba-border">
            <img src={selectedPhoto} alt="Preview" className="w-16 h-16 object-cover" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/70 text-white text-[10px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Photo attach button */}
          <button
            type="button"
            onClick={() =>
              setSelectedPhoto(
                'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80'
              )
            }
            className="p-2.5 rounded-2xl bg-heiba-bg border border-heiba-border text-heiba-secondary hover:text-heiba-text hover:bg-heiba-beige transition-colors"
            title={t.chat.uploadPhoto}
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.chat.placeholder}
            className="flex-1 px-4 py-3 bg-heiba-bg border border-heiba-border rounded-2xl text-xs text-heiba-text placeholder-heiba-secondary focus:border-heiba-accent outline-none"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !selectedPhoto}
            className="p-3 rounded-2xl bg-heiba-accent text-white shadow-coral hover:bg-heiba-accentHover active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
