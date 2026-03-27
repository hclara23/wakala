'use client';

import { useState } from 'react';
import { 
  Trash2, 
  Droplet, 
  Wrench, 
  Wind, 
  Hammer, 
  Truck, 
  Send,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { services } from '@/lib/site-data';

const projectTypes = [
  { id: 'dumpster', label: 'Dumpster', icon: Trash2 },
  { id: 'washing', label: 'Washing', icon: Droplet },
  { id: 'repairs', label: 'Repairs', icon: Wrench },
  { id: 'cleanup', label: 'Cleanup', icon: Wind },
  { id: 'remodel', label: 'Remodel', icon: Hammer },
  { id: 'hauling', label: 'Hauling', icon: Truck },
];

export default function CreativeContactForm() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      details: formData.get('details'),
      projectType: selectedType,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send inquiry');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again or call us directly.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-[2.5rem] bg-amber-300 py-16 px-8 text-center"
      >
        <div className="rounded-full bg-black/10 p-4">
          <CheckCircle2 className="h-12 w-12 text-black" />
        </div>
        <h3 className="mt-6 font-serif text-3xl text-black">Message Sent!</h3>
        <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-black/70">
          Wakala received your project details. We&apos;ll reach out shortly to discuss the scope and 
          pricing for your {selectedType} project.
        </p>
        <button 
          onClick={() => { setIsSubmitted(false); setSelectedType(null); }}
          className="mt-8 text-xs font-bold uppercase tracking-widest text-black underline underline-offset-4"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/40 p-8 md:p-10">
      <div className="mb-8 border-b border-white/5 pb-6">
        <p className="section-kicker">Project Builder</p>
        <h3 className="mt-3 font-serif text-3xl text-white">Tell us about the job.</h3>
        <p className="mt-3 text-sm leading-7 text-stone-400">
          Select a service type below to start your inquiry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {projectTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelectedType(type.id)}
                className={`flex flex-col items-center gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                  isSelected 
                    ? 'border-amber-300 bg-amber-300 text-black' 
                    : 'border-white/10 bg-white/[0.03] text-stone-400 hover:border-white/30 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-black' : 'text-stone-300'}`} />
                <span className="text-[0.6rem] font-bold uppercase tracking-widest">
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-5 md:grid-cols-2"
            >
              <div className="space-y-2">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-stone-500 ml-2">
                  Full Name
                </label>
                <input
                  required
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-stone-700 focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-stone-500 ml-2">
                  Email Address
                </label>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-stone-700 focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/50 transition-colors"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[0.65rem] font-bold uppercase tracking-widest text-stone-500 ml-2">
                  Project Details
                </label>
                <textarea
                  required
                  name="details"
                  rows={3}
                  placeholder={`Tell us about your ${selectedType} project needs...`}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white placeholder:text-stone-700 focus:border-amber-300/50 focus:outline-none focus:ring-1 focus:ring-amber-300/50 transition-colors resize-none"
                />
              </div>
              
              {error && (
                <div className="md:col-span-2 text-xs font-semibold text-red-400 px-2">
                  {error}
                </div>
              )}

              <button
                disabled={isLoading}
                type="submit"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-amber-300 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-amber-200 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Request'}
                {!isLoading && <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
