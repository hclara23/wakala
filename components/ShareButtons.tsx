'use client';

import React, { useState } from 'react';
import { Facebook, Linkedin, Twitter, Link as LinkIcon, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
  variant?: 'sidebar' | 'bottom';
}

export function ShareButtons({ url, title, className, variant = 'sidebar' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-[#1877F2]',
    },
    {
      name: 'X (Twitter)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'hover:text-[#1DA1F2]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      color: 'hover:text-[#0A66C2]',
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = (href: string) => {
    window.open(href, '_blank', 'noopener,noreferrer,width=600,height=400');
  };

  if (variant === 'bottom') {
    return (
      <div className={cn('flex flex-col gap-6 pt-8 border-t border-white/10', className)}>
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Share this article</p>
        <div className="flex flex-wrap gap-4">
          {shareLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleShare(link.href)}
              className={cn(
                'group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 transition-all hover:border-white/25',
                link.color
              )}
              title={`Share on ${link.name}`}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-sm font-medium text-stone-300 group-hover:text-white">
                {link.name}
              </span>
            </button>
          ))}
          <button
            onClick={handleCopy}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-3 transition-all hover:border-white/25 hover:text-amber-300"
            title="Copy link"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Check className="h-5 w-5 text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <Copy className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="text-sm font-medium text-stone-300 group-hover:text-white">
              {copied ? 'Copied!' : 'Copy Link'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Share Article</p>
      <div className="grid grid-cols-4 gap-2">
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link.href)}
            className={cn(
              'flex h-12 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-stone-400 transition-all hover:border-white/25',
              link.color
            )}
            title={`Share on ${link.name}`}
          >
            <link.icon className="h-5 w-5" />
          </button>
        ))}
        <button
          onClick={handleCopy}
          className="flex h-12 items-center justify-center rounded-xl border border-white/10 bg-black/30 text-stone-400 transition-all hover:border-white/25 hover:text-amber-300"
          title="Copy link"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Check className="h-5 w-5 text-green-400" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
              >
                <Copy className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
