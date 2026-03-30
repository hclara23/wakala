'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type AdminWorkflowWizardProps = {
  current: 'leads' | 'reservations';
  className?: string;
};

type WizardStep = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  note: string;
  accent: 'amber' | 'emerald' | 'sky';
  href?: string;
  hrefLabel?: string;
};

const STORAGE_KEY = 'wakala-admin-workflow-wizard-v1';

function getWizardSteps(current: AdminWorkflowWizardProps['current']): WizardStep[] {
  const steps: WizardStep[] = [
    {
      id: 'intake',
      eyebrow: 'Public Intake',
      title: 'Know where work enters the webapp',
      description:
        'The public site creates business in two different ways, and the admin workflow makes more sense once that split is clear.',
      bullets: [
        'The project builder form creates quote leads with contact details, job notes, and marketing attribution.',
        'The dumpster checkout flow creates both a reservation record and a linked lead before Stripe collects payment.',
        'Phone and email links stay available on the site for customers who prefer direct contact instead of forms.',
        'Blog, gallery, and service landing pages support acquisition and feed the analytics panels inside admin.',
      ],
      note:
        'When a customer says they used the website, search the lead inbox first. The lead record is the best front door for almost every conversation.',
      accent: 'amber',
      href: '/admin/leads',
      hrefLabel: 'Open lead inbox',
    },
    {
      id: 'leads',
      eyebrow: 'Lead Inbox',
      title: 'Use the lead inbox as the operating board',
      description:
        'The lead inbox is where new opportunities are qualified, organized, and moved toward a job or a paid reservation.',
      bullets: [
        'Pipeline stages show where each lead sits: new, contacted, quoted, won, scheduled, completed, or lost.',
        'Search and filters let you find customers by name, phone, email, service type, reservation reference, or campaign.',
        'Lead cards keep contact tools, service notes, source data, and internal notes in one place.',
        'CSV export gives you a portable backup of the pipeline whenever you need an offline copy.',
      ],
      note:
        'If a lead does not have a next step, it is at risk. Use the card controls so every opportunity leaves the inbox with a clear status.',
      accent: 'sky',
      href: '/admin/leads',
      hrefLabel: 'Review lead pipeline',
    },
    {
      id: 'quotes',
      eyebrow: 'Sales Discipline',
      title: 'Run follow-ups, quotes, and reminders from the same card',
      description:
        'Every lead card is built to hold the full sales motion so callbacks, pricing, and scope do not drift into text threads or memory.',
      bullets: [
        'Set follow-up status and date to keep callbacks visible and highlight overdue work.',
        'Track quote status from draft to sent to accepted or declined.',
        'Store quote amount and quote scope so pricing decisions are attached to the lead record.',
        'Use internal notes to capture site access issues, negotiation context, or what must happen next.',
      ],
      note:
        'A good daily rule is simple: every active lead should either have a scheduled follow-up date or a quote status that explains the next move.',
      accent: 'amber',
    },
    {
      id: 'jobs',
      eyebrow: 'Delivery Handoff',
      title: 'Convert accepted work into live jobs',
      description:
        'Once the quote is ready, the lead inbox can promote the opportunity into active work without losing the sales history.',
      bullets: [
        'Save the quote amount and scope, then use Convert To Job when the customer is ready to move forward.',
        'Add a job date and service window to turn the lead into a scheduled operational record inside the pipeline.',
        'Completed jobs can then move into review requested and review received states.',
        'Review tracking helps Wakala close the loop and turn finished jobs into social proof and repeat business.',
      ],
      note:
        'Think of Convert To Job as the bridge between sales and operations. It marks the moment the business stops quoting and starts delivering.',
      accent: 'emerald',
    },
    {
      id: 'reservations',
      eyebrow: 'Reservations',
      title: 'Use reservation operations for paid dumpster dispatch',
      description:
        'Reservations are the dispatch lane for customers who already paid online and now need a confirmed date, time window, and internal handling.',
      bullets: [
        'Paid revenue, pending review, unscheduled paid orders, and next-7-day counts tell you what needs attention first.',
        'Each reservation keeps payment state, preferred date, scheduled date, delivery window, and internal notes together.',
        'Lead cards can jump directly to linked reservations so quote history and paid fulfillment stay connected.',
        'This page is the right place to confirm the window, update the status, and keep the crew aligned for delivery day.',
      ],
      note:
        'Lead inbox is for selling and relationship management. Reservation operations is for confirming paid work and keeping dispatch clean.',
      accent: 'sky',
      href: '/admin/reservations',
      hrefLabel: 'Open reservations',
    },
    {
      id: 'analytics',
      eyebrow: 'Acquisition',
      title: 'Read analytics to decide where growth is coming from',
      description:
        'The admin dashboard pulls marketing and site-performance signals into the same place as jobs, quotes, and reservations.',
      bullets: [
        'The funnel on the lead page shows sessions, leads, checkout starts, paid reservations, and won jobs.',
        'Source mix, landing pages, campaign tags, and referrer hosts help explain where opportunities originate.',
        'The reservations page shows the Google Analytics snapshot with traffic, channels, top pages, and tracked events.',
        'These panels help you judge which pages and campaigns deserve more focus instead of guessing from traffic alone.',
      ],
      note:
        'If the funnel is healthy, traffic becomes leads and then jobs. If it is weak, use the source and landing-page data to find the gap.',
      accent: 'amber',
    },
  ];

  if (current === 'leads') {
    steps.push({
      id: 'daily-rhythm',
      eyebrow: 'Daily Rhythm',
      title: 'Start each day in the lead inbox',
      description:
        'For most admin sessions, the lead inbox should be the first screen because it shows who needs a callback, a quote, or a next step.',
      bullets: [
        'Filter for overdue reminders and active quotes first.',
        'Move qualified leads into contacted, quoted, won, or lost so the pipeline stays honest.',
        'Convert accepted quotes into jobs with dates and windows before they disappear into manual notes.',
        'After sales work is current, switch to reservations to confirm paid dumpster deliveries.',
      ],
      note:
        'A strong operating rhythm is: clear follow-ups, send quotes, convert wins, then hand off to reservations and review requests.',
      accent: 'emerald',
      href: '/admin/leads',
      hrefLabel: 'Work today from leads',
    });
  } else {
    steps.push({
      id: 'dispatch-rhythm',
      eyebrow: 'Daily Rhythm',
      title: 'Use reservations as the dispatch lane',
      description:
        'When paid reservations are already coming in, this page becomes the place to turn money collected online into a clean delivery schedule.',
      bullets: [
        'Check paid but unscheduled reservations before anything else.',
        'Set the delivery date and window so the crew knows what is locked in.',
        'Use internal notes for gate codes, placement instructions, or customer communication.',
        'Return to the lead inbox for quote follow-ups, review requests, and non-checkout service work.',
      ],
      note:
        'Reservations should feel operational, not sales-oriented. Keep the page focused on confirmed work and schedule clarity.',
      accent: 'emerald',
      href: '/admin/reservations',
      hrefLabel: 'Work today from reservations',
    });
  }

  return steps;
}

function getAccentClasses(accent: WizardStep['accent']) {
  switch (accent) {
    case 'emerald':
      return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-50';
    case 'sky':
      return 'border-sky-400/25 bg-sky-400/10 text-sky-50';
    default:
      return 'border-amber-300/25 bg-amber-300/10 text-amber-50';
  }
}

export default function AdminWorkflowWizard({
  current,
  className,
}: AdminWorkflowWizardProps) {
  const steps = getWizardSteps(current);
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let nextComplete = false;
    let shouldAutoOpen = false;

    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            introducedAt: new Date().toISOString(),
            completed: false,
          })
        );
        shouldAutoOpen = true;
      } else {
        const parsedValue = JSON.parse(rawValue) as { completed?: boolean };
        nextComplete = Boolean(parsedValue.completed);
      }
    } catch {
      shouldAutoOpen = true;
    }

    const frame = window.requestAnimationFrame(() => {
      setIsComplete(nextComplete);

      if (shouldAutoOpen) {
        setIsOpen(true);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const step = steps[activeStep];
  const progress = ((activeStep + 1) / steps.length) * 100;
  const isLastStep = activeStep === steps.length - 1;

  function persistState(completed: boolean) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          introducedAt: new Date().toISOString(),
          completed,
          completedAt: completed ? new Date().toISOString() : null,
        })
      );
    } catch {
      // Ignore storage failures; the guide still works without persistence.
    }
  }

  function openWizard() {
    setActiveStep(0);
    setIsOpen(true);
  }

  function completeWizard() {
    persistState(true);
    setIsComplete(true);
    setIsOpen(false);
    setActiveStep(0);
  }

  return (
    <>
      <button
        type="button"
        onClick={openWizard}
        className={cn(
          'inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5',
          className
        )}
      >
        {isComplete ? 'Workflow Guide' : 'Launch Guide'}
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm md:px-6 md:py-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-workflow-wizard-title"
        >
          <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#090705] shadow-[0_30px_120px_rgba(0,0,0,0.55)] lg:grid-cols-[0.92fr_1.08fr]">
            <aside className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))] p-6 lg:border-b-0 lg:border-r lg:p-8">
              <p className="text-xs uppercase tracking-[0.34em] text-amber-200/80">
                Wakala Admin Playbook
              </p>
              <h2 className="mt-4 font-serif text-3xl text-white md:text-4xl">
                Learn the workflow before the day gets noisy.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-stone-300">
                This guide walks through how leads, reservations, quotes, reviews, and analytics
                connect inside the webapp so the admin dashboard feels like one operating system.
              </p>

              <div className="mt-6 h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-300 transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-6 space-y-3">
                {steps.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      'flex w-full items-start gap-4 rounded-[1.35rem] border px-4 py-4 text-left transition',
                      index === activeStep
                        ? 'border-amber-300/35 bg-amber-300/10'
                        : 'border-white/10 bg-black/25 hover:border-white/25 hover:bg-white/5'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold uppercase tracking-[0.2em]',
                        index === activeStep
                          ? 'border-amber-300/45 bg-amber-300 text-black'
                          : 'border-white/15 text-stone-300'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span>
                      <span className="block text-[11px] uppercase tracking-[0.28em] text-stone-500">
                        {item.eyebrow}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white">
                        {item.title}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-5 text-sm leading-7 text-stone-300">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Operator rhythm</p>
                <p className="mt-3">
                  Clear follow-ups, send quotes, convert wins, lock paid reservations, then request
                  reviews after the work is done.
                </p>
              </div>
            </aside>

            <div className="p-6 md:p-8">
              <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.34em] text-stone-500">
                    Step {activeStep + 1} of {steps.length}
                  </p>
                  <h3
                    id="admin-workflow-wizard-title"
                    className="mt-3 font-serif text-4xl text-white md:text-5xl"
                  >
                    {step.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center self-start border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white transition hover:border-white/50 hover:bg-white/5"
                >
                  Close
                </button>
              </div>

              <p className="mt-6 max-w-3xl text-base leading-8 text-stone-200">
                {step.description}
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {step.bullets.map((bullet) => (
                  <div
                    key={bullet}
                    className="rounded-[1.5rem] border border-white/10 bg-black/30 px-4 py-4 text-sm leading-7 text-stone-200"
                  >
                    {bullet}
                  </div>
                ))}
              </div>

              <div
                className={cn(
                  'mt-6 rounded-[1.75rem] border p-5 text-sm leading-7',
                  getAccentClasses(step.accent)
                )}
              >
                <p className="text-xs uppercase tracking-[0.24em] opacity-70">Operator note</p>
                <p className="mt-3">{step.note}</p>

                {step.href && step.hrefLabel ? (
                  <Link
                    href={step.href}
                    onClick={() => setIsOpen(false)}
                    className="mt-4 inline-flex items-center justify-center border border-current/25 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-current transition hover:bg-white/10"
                  >
                    {step.hrefLabel}
                  </Link>
                ) : null}
              </div>

              <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep((value) => Math.max(0, value - 1))}
                  disabled={activeStep === 0}
                  className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>

                <div className="flex flex-col gap-3 md:flex-row">
                  <button
                    type="button"
                    onClick={completeWizard}
                    className="inline-flex items-center justify-center border border-white/15 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-white transition hover:border-white/50 hover:bg-white/5"
                  >
                    Mark Complete
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      isLastStep
                        ? completeWizard()
                        : setActiveStep((value) => Math.min(steps.length - 1, value + 1))
                    }
                    className="inline-flex items-center justify-center border border-amber-300/40 bg-amber-300 px-5 py-3 text-xs font-semibold uppercase tracking-[0.28em] text-black transition hover:bg-amber-200"
                  >
                    {isLastStep ? 'Finish Guide' : 'Next Step'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
