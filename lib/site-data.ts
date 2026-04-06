import { blogImageAssets, galleryImageAssets, type SiteImage } from '@/lib/site-images';

export const site = {
  name: 'Wakala Cleaning Services',
  shortName: 'Wakala',
  title: 'Wakala Roll-Offs & Cleaning Services',
  description:
    'Wakala provides roll-off dumpsters, trailer rentals, pressure washing, handyman work, yard cleanups, and small remodel support for residential and commercial projects in El Paso, Texas.',
  tagline:
    'Roll-offs, cleanup crews, and property-ready work for El Paso jobs that need fast scheduling and dependable follow-through.',
  url: process.env.APP_URL || 'https://wakalapropertyservices.com',
  phone: '9154551645',
  phoneDisplay: '(915) 455-1645',
  email: 'wakalaep915@gmail.com',
  areaServed: 'El Paso, TX',
  googleBusinessUrl: 'https://share.google/6ey4dQjp4MJ5h2FYU',
  logo: '/images/wakala-logo-alt.png',
  ogImage: '/images/og-image.jpg',
  primaryPaymentLabel: 'Pay $300 dumpster rental',
  quoteLabel: 'Call for a quote',
} as const;

export const serviceRegions = [
  { name: 'West El Paso', slug: 'west-el-paso' },
  { name: 'East Side', slug: 'east-side' },
  { name: 'Northeast', slug: 'northeast' },
  { name: 'El Paso General', slug: 'el-paso' },
] as const;

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export const reviews: Review[] = [
  {
    author: 'Gabby Thomas',
    rating: 5,
    text: 'Amazing, they saved me in a pinch! I needed to get a washing machine picked up and installed and the old one hauled away. They got it done same day and quickly! Customer service was amazing!',
    date: '2 weeks ago',
  },
  {
    author: 'Sal Vazquez',
    rating: 5,
    text: 'Great service and most importantly great and very modest pricing !!!',
    date: '2 weeks ago',
  },
  {
    author: 'Victor Ranjel Ayala',
    rating: 5,
    text: 'Awesome services, they take care and maintain my yard every month. I highly recommend using walls for all cleaning services.',
    date: '1 week ago',
  },
  {
    author: 'John Malmquist',
    rating: 5,
    text: 'Wakala provides dependable property support and fast coordination. Highly recommended for dumpster rentals and cleanup work.',
    date: '2 weeks ago',
  },
] as const;

export const navigation = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
] as const;

export const checkoutItems = {
  dumpster_15_reservation: {
    id: 'dumpster_15_reservation',
    name: '15-Yard Dumpster Rental (Full Payment)',
    description:
      'Full payment for a 15-yard roll-off dumpster for a three-day rental window. The reservation is saved immediately and scheduling is finalized by Wakala after payment.',
    priceEnvVar: 'STRIPE_PRICE_DUMPSTER_15_RESERVATION',
    unitAmount: 30000,
    buttonLabel: 'Complete full payment',
    reservationLabel: '15-yard dumpster full rental payment',
    successPath: '/thank-you',
    cancelPath: '/checkout/canceled',
  },
} as const;

export type CheckoutItemId = keyof typeof checkoutItems;

export const services = [
  {
    slug: 'dumpster-rentals',
    title: 'Dumpster Rentals',
    eyebrow: 'Roll-Offs',
    summary:
      'Reliable 15-yard roll-off dumpsters for cleanouts, renovation debris, and contractor punch lists.',
    description:
      'Wakala keeps dumpster scheduling simple: fast confirmation, clear placement expectations, and pickup coordinated around the job instead of against it.',
    features: [
      '15-yard roll-off option',
      'Straightforward flat-rate reservation',
      'Residential and contractor cleanouts',
      'Fast delivery coordination',
    ],
    image: '/images/dumpster.jpg',
    checkoutItemId: 'dumpster_15_reservation' as CheckoutItemId,
    ctaLabel: 'Reserve a dumpster',
  },
  {
    slug: 'trailer-rentals',
    title: 'Trailer Rentals',
    eyebrow: 'Hauling',
    summary:
      'Heavy-duty trailer rentals for materials, tools, debris, and jobsite hauling.',
    description:
      'When a full roll-off is not the right fit, trailer rentals give homeowners and crews a flexible way to move equipment, junk, and supplies on their own timeline.',
    features: [
      'Utility and dump trailer support',
      'Flexible rental windows',
      'Tow-ready equipment',
      'Useful for remodel and landscape jobs',
    ],
    image: '/images/trailer.jpg',
    checkoutItemId: null,
    ctaLabel: 'Request trailer pricing',
  },
  {
    slug: 'pressure-washing',
    title: 'Pressure Washing',
    eyebrow: 'Exterior Care',
    summary:
      'Driveway, siding, walkway, and patio washing that removes buildup without dragging the job out.',
    description:
      'Exterior surfaces in El Paso collect dust, runoff, and hard-use grime quickly. Wakala handles pressure washing with the pace and detail expected on residential and light commercial work.',
    features: [
      'Driveways and sidewalks',
      'House siding and stucco touch-up areas',
      'Decks, patios, and entries',
      'Before-and-after cleanup readiness',
    ],
    image: '/images/pressure-wash.jpg',
    checkoutItemId: null,
    ctaLabel: 'Book an estimate',
  },
  {
    slug: 'handyman-services',
    title: 'Handyman Services',
    eyebrow: 'Repairs',
    summary:
      'Practical repair and maintenance help for homes, rentals, and small commercial spaces.',
    description:
      'From patching drywall to replacing fixtures, Wakala focuses on the repair work that keeps a property rentable, functional, and ready for the next phase.',
    features: [
      'Drywall patching and trim fixes',
      'Fixture and hardware swaps',
      'Door and window adjustments',
      'Punch-list completion support',
    ],
    image: '/images/handyman.jpg',
    checkoutItemId: null,
    ctaLabel: 'Discuss your project',
  },
  {
    slug: 'yard-cleanups',
    title: 'Yard Cleanups',
    eyebrow: 'Property Reset',
    summary:
      'Storm cleanup, overgrowth removal, junk hauling, and prep work that makes a property manageable again.',
    description:
      'Yard cleanup work often overlaps with hauling and disposal. Wakala can reset outdoor spaces quickly so the property looks cared for and the next crew can get started.',
    features: [
      'Brush and debris removal',
      'Move-out and turnover cleanup',
      'Storm and wind event cleanup',
      'Landscape prep support',
    ],
    image: '/images/yard.jpg',
    checkoutItemId: null,
    ctaLabel: 'Plan a cleanup',
  },
  {
    slug: 'small-remodels',
    title: 'Small Remodels',
    eyebrow: 'Updates',
    summary:
      'Light remodel support for kitchens, bathrooms, and rental refresh projects.',
    description:
      'Wakala handles the smaller remodel tasks that improve presentation and utility without turning the job into a sprawling rebuild.',
    features: [
      'Bathroom vanity and fixture swaps',
      'Flooring and finish updates',
      'Cabinet paint refreshes',
      'Turnover-ready touchups',
    ],
    image: '/images/remodel.jpg',
    checkoutItemId: null,
    ctaLabel: 'Get remodel help',
  },
] as const;

export const companyPrinciples = [
  {
    title: 'Fast communication',
    description:
      'Clients should know what is happening, when the crew is arriving, and what the next step is without chasing updates.',
  },
  {
    title: 'Clean jobsites',
    description:
      'Whether the service is washing, hauling, or repairs, the end result should leave the property looking more controlled than it started.',
  },
  {
    title: 'Practical service mix',
    description:
      'Roll-offs, cleanup, exterior washing, and repair work overlap in the real world. Wakala keeps those services connected instead of treating every task like a handoff.',
  },
] as const;

export const processSteps = [
  {
    title: '1. Call or send project details',
    description:
      'Share the address, service type, timeline, and a few photos if you have them. That is usually enough to scope the next step.',
  },
  {
    title: '2. Confirm schedule and pricing',
    description:
      'Wakala confirms availability, clarifies job assumptions, and points you to the right path: direct reservation or quote-based scheduling.',
  },
  {
    title: '3. Finish the work cleanly',
    description:
      'On service day the focus is straightforward execution, property care, and leaving the site ready for what comes next.',
  },
] as const;

export type GalleryImage = {
  src: SiteImage;
  title: string;
  category: string;
  alt: string;
  summary: string;
  serviceLine: string;
};

export const galleryImages: GalleryImage[] = [
  {
    src: galleryImageAssets.drivewayWashing,
    title: 'Driveway washing that resets curb appeal fast',
    category: 'Pressure Washing',
    alt: 'Concrete driveway being pressure washed on an El Paso property.',
    summary:
      'High-traffic concrete is one of the fastest places to show visible improvement before a showing, turnover, or cleanup handoff.',
    serviceLine: 'Driveways and hardscape cleaning',
  },
  {
    src: galleryImageAssets.yardCleanupWorker,
    title: 'Yard cleanup work that restores access and control',
    category: 'Yard Cleanup',
    alt: 'Crew member clearing a yard and removing outdoor debris.',
    summary:
      'Overgrowth, scattered debris, and move-out leftovers can be cleared in one reset so the property feels manageable again.',
    serviceLine: 'Storm cleanup, hauling, and outdoor reset work',
  },
  {
    src: galleryImageAssets.drywallRemodel,
    title: 'Small remodel prep and drywall repair support',
    category: 'Small Remodels',
    alt: 'Drywall and interior remodel work underway inside a property.',
    summary:
      'Interior patching and finish-stage work help rentals, listings, and punch-list projects reach a cleaner handoff.',
    serviceLine: 'Interior repairs and turnover-ready updates',
  },
  {
    src: galleryImageAssets.appliancePickup,
    title: 'Bulky appliance pickup for cleaner turnover spaces',
    category: 'Junk Removal',
    alt: 'Large unwanted appliances staged for removal and proper disposal.',
    summary:
      'Bulky item removal clears visual clutter fast and helps homeowners or landlords move into the repair and cleaning phase sooner.',
    serviceLine: 'Appliance haul-out and disposal support',
  },
  {
    src: galleryImageAssets.walkwayWashing,
    title: 'Walkway washing for safer, cleaner entries',
    category: 'Pressure Washing',
    alt: 'Outdoor walkway and brick path being washed with pressure cleaning equipment.',
    summary:
      'Entry paths and garden walks often make the first impression, so surface cleaning here pays off quickly.',
    serviceLine: 'Walkways, patios, and entry-point washing',
  },
  {
    src: galleryImageAssets.yardCleanupMaintenance,
    title: 'Property refresh work that leaves the site presentation-ready',
    category: 'Property Care',
    alt: 'Outdoor property area after cleanup and maintenance work.',
    summary:
      'Cleanup is strongest when it leaves the property looking intentionally reset instead of only partially improved.',
    serviceLine: 'Exterior cleanup paired with visual finishing',
  },
  {
    src: galleryImageAssets.handymanTools,
    title: 'Handyman jobs backed by ready-to-work tools and materials',
    category: 'Handyman',
    alt: 'Carpenter preparing tools before starting repair work.',
    summary:
      'Small repairs and maintenance work move faster when the crew is set up to handle punch-list items in one visit.',
    serviceLine: 'Minor repairs, finish work, and maintenance',
  },
  {
    src: galleryImageAssets.pressureWashingSteps,
    title: 'Detailed washing on steps, edges, and high-use surfaces',
    category: 'Surface Cleaning',
    alt: 'Pressure washer cleaning outdoor steps and detail edges.',
    summary:
      'The difference between a quick rinse and a real reset often shows up in steps, edges, and transition areas.',
    serviceLine: 'Detail washing for high-visibility hardscape',
  },
  {
    src: galleryImageAssets.applianceHaul,
    title: 'Large haul-out loads handled before the next trade arrives',
    category: 'Haul-Outs',
    alt: 'Pile of bulky household and electrical goods prepared for removal.',
    summary:
      'Removing heavy mixed waste early keeps repair, cleaning, and rental turnover work from getting blocked.',
    serviceLine: 'Debris and bulky-item removal',
  },
  {
    src: galleryImageAssets.unwantedAppliances,
    title: 'Appliance removal that opens the space back up',
    category: 'Junk Removal',
    alt: 'Unwanted appliances staged and ready for disposal.',
    summary:
      'Large unwanted items often dominate the visual impression of a property; hauling them out changes the feel immediately.',
    serviceLine: 'Junk removal for move-outs and cleanouts',
  },
  {
    src: galleryImageAssets.trashBefore,
    title: 'Before: overloaded bins and a cluttered service area',
    category: 'Before',
    alt: 'Overflowing outdoor trash bins before cleanup service.',
    summary:
      'The before condition shows the type of overflow and disorder that often triggers a wider cleanup request.',
    serviceLine: 'Before-and-after property reset',
  },
  {
    src: galleryImageAssets.trashAfter,
    title: 'After: a cleaner, calmer area ready for normal use',
    category: 'After',
    alt: 'Outdoor trash area after cleanup and organization work.',
    summary:
      'The goal is not only removal. It is leaving the property looking controlled, usable, and ready for what comes next.',
    serviceLine: 'Before-and-after property reset',
  },
];

export type BlogSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
  image?: SiteImage;
  imageAlt?: string;
};

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  coverImage: SiteImage;
  coverAlt: string;
  tags: string[];
  keywords: string[];
  takeaways: string[];
  sections: BlogSection[];
  faq: BlogFaq[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-choose-the-right-dumpster-size-for-an-el-paso-cleanout',
    title: 'How to Choose the Right Dumpster Size for an El Paso Cleanout',
    excerpt:
      'A practical guide to deciding when a 15-yard dumpster is the right fit for household junk, renovation debris, and fast property cleanouts in El Paso.',
    description:
      'Learn how El Paso homeowners and contractors can choose the right roll-off dumpster size, avoid overloading, and keep cleanup projects moving.',
    publishedAt: '2026-03-09',
    readingTime: '5 min read',
    coverImage: blogImageAssets.dumpsterGuide,
    coverAlt: 'Bulky household items and debris gathered for a major cleanout.',
    tags: ['Dumpster Rental', 'El Paso', 'Cleanouts'],
    keywords: [
      'El Paso dumpster rental',
      '15 yard dumpster',
      'roll-off dumpster cleanout',
      'construction debris dumpster',
    ],
    takeaways: [
      'A 15-yard roll-off works well for many garage cleanouts, room remodels, and move-out projects.',
      'The right dumpster depends on debris type, weight, and how quickly you need pickup.',
      'Discuss placement and loading limits before delivery so the job stays smooth.',
    ],
    sections: [
      {
        heading: 'Start with the type of debris, not just the volume',
        paragraphs: [
          'Many people estimate dumpster size by looking at the size of the pile alone. That is usually the wrong first step. Drywall, tile, roofing scraps, brush, broken furniture, and mixed household junk all stack differently and weigh differently.',
          'For a typical El Paso cleanout, a 15-yard dumpster is a practical middle ground. It is often enough for garage cleanups, rental turnover debris, flooring tear-outs, or a single-room renovation without taking up the footprint of a much larger container.',
        ],
      },
      {
        heading: 'Know when a 15-yard dumpster is the right call',
        paragraphs: [
          'If the project is limited to a home cleanout, small remodel, or moderate debris load, a 15-yard container is usually the most efficient option. It gives you real hauling capacity without overcommitting space on the driveway or jobsite.',
          'For contractors, it is also a useful choice when the job needs steady debris control but not a full-scale commercial container.',
        ],
        list: [
          'Garage or shed cleanouts',
          'Kitchen or bathroom remodel debris',
          'Move-out junk and bulky household items',
          'Light contractor punch-list cleanup',
        ],
      },
      {
        heading: 'Plan for placement and pickup before delivery day',
        paragraphs: [
          'The delivery spot matters almost as much as the container size. Make sure the placement area is clear, level, and easy for the truck to access. This avoids day-of delays and reduces the chance of moving vehicles, materials, or equipment twice.',
          'Ask how long the rental window lasts and what happens if the project runs longer than expected. That detail matters most on remodel work where debris often shows up in waves instead of all at once.',
        ],
      },
      {
        heading: 'Avoid the common mistakes that slow cleanouts down',
        paragraphs: [
          'The most common dumpster problems are overloading, mixing prohibited material without asking first, and waiting too long to schedule pickup. A quick conversation upfront solves most of that.',
          'If you are not sure whether the project fits one container, describe the work honestly. It is better to book the right setup the first time than to lose time reshuffling debris later.',
        ],
      },
    ],
    faq: [
      {
        question: 'What projects fit best in a 15-yard dumpster?',
        answer:
          'It is a strong fit for home cleanouts, moderate remodel debris, yard cleanup waste, and many rental turnover jobs.',
      },
      {
        question: 'Can a dumpster sit in a driveway?',
        answer:
          'In many cases yes, but access, slope, and surrounding vehicles all matter. Confirm placement details before delivery.',
      },
      {
        question: 'Why reserve the dumpster before the project starts?',
        answer:
          'Reservation locks in scheduling so the cleanup can start on time instead of waiting for availability.',
      },
    ],
  },
  {
    slug: 'best-time-to-pressure-wash-a-house-and-driveway-in-el-paso',
    title: 'Best Time to Pressure Wash a House and Driveway in El Paso',
    excerpt:
      'Dust, wind, monsoon runoff, and hard sun all affect exterior surfaces in El Paso. This guide explains when pressure washing is worth scheduling and what to prioritize.',
    description:
      'Pressure washing timing matters in El Paso. Learn when to clean driveways, walkways, siding, and patios for better results and less repeat buildup.',
    publishedAt: '2026-03-11',
    readingTime: '6 min read',
    coverImage: blogImageAssets.pressureWashingGuide,
    coverAlt: 'Driveway being pressure washed for a cleaner exterior finish.',
    tags: ['Pressure Washing', 'Exterior Cleaning', 'El Paso'],
    keywords: [
      'pressure washing El Paso',
      'driveway cleaning El Paso',
      'best time to pressure wash house',
      'pressure washing after dust storm',
    ],
    takeaways: [
      'Pressure washing is most useful after dusty stretches, monsoon runoff, or before a listing, event, or turnover.',
      'Driveways, walkways, and entry points usually deliver the fastest visible improvement.',
      'Scheduling at the right time keeps exterior cleaning from becoming repeat work too soon.',
    ],
    sections: [
      {
        heading: 'Why El Paso properties need a different cleaning rhythm',
        paragraphs: [
          'Exterior cleaning in El Paso is shaped by wind, dust, heat, and seasonal runoff. Surfaces can look dull quickly even when the property is otherwise maintained. That is why timing matters more than a generic once-a-year cleaning rule.',
          'Homes, rentals, and small commercial properties benefit most when washing is tied to real conditions: after dust-heavy periods, after storm runoff, or before an important handoff such as a sale, tenant turnover, or event.',
        ],
      },
      {
        heading: 'Focus first on the surfaces people see and walk on',
        paragraphs: [
          'Driveways, front walks, patios, and entry areas usually show the biggest difference first. These are also the surfaces that shape curb appeal the fastest. If the goal is visible improvement, start there.',
          'Siding, walls, gates, and fences may still need attention, but high-traffic horizontal surfaces often create the quickest and most obvious payoff for homeowners and property managers.',
        ],
        list: [
          'Driveways with tracked-in dirt and stains',
          'Walkways that collect dust buildup',
          'Patios used for family or tenant traffic',
          'Front entry areas before photos or showings',
        ],
      },
      {
        heading: 'Schedule around weather and property use',
        paragraphs: [
          'If you schedule immediately before a windy week or heavy site activity, the clean finish may not last long. It is smarter to line pressure washing up with calmer stretches, project completion, or a date when the property actually needs to look sharp.',
          'For rental or listing prep, washing often works best near the end of the turnover sequence, after hauling and repair work are finished but before final photography or showings.',
        ],
      },
      {
        heading: 'Pair washing with cleanup and light repair work when needed',
        paragraphs: [
          'Pressure washing often makes the most sense as part of a broader reset. If the yard still has debris, the curbside area is cluttered, or exterior touchups are still pending, it is worth sequencing those tasks together.',
          'That is part of why a mixed-service company can be useful. Washing, cleanup, hauling, and light repairs usually affect the same property impression.',
        ],
      },
    ],
    faq: [
      {
        question: 'How often should a driveway be pressure washed in El Paso?',
        answer:
          'That depends on exposure and traffic, but many properties benefit after dusty periods, runoff, or before a visible event like a listing or turnover.',
      },
      {
        question: 'What should be cleaned first if the budget is limited?',
        answer:
          'Start with the driveway, walkways, patio, and front entry because those areas typically create the biggest visible improvement.',
      },
      {
        question: 'Should pressure washing happen before or after yard cleanup?',
        answer:
          'Usually after hauling and general cleanup so surfaces stay cleaner and the final result looks intentional.',
      },
    ],
  },
  {
    slug: 'yard-cleanup-checklist-after-an-el-paso-windstorm',
    title: 'Yard Cleanup Checklist After an El Paso Windstorm',
    excerpt:
      'Wind events turn outdoor spaces into scattered debris fields fast. This checklist helps homeowners and landlords decide what to remove first and what can wait.',
    description:
      'Use this El Paso yard cleanup checklist after a windstorm to clear debris safely, restore curb appeal, and prepare the property for the next step.',
    publishedAt: '2026-03-13',
    readingTime: '5 min read',
    coverImage: blogImageAssets.yardCleanupGuide,
    coverAlt: 'Worker clearing outdoor debris during a yard cleanup.',
    tags: ['Yard Cleanup', 'Storm Cleanup', 'El Paso'],
    keywords: [
      'El Paso yard cleanup',
      'windstorm cleanup checklist',
      'storm debris removal El Paso',
      'property cleanup services',
    ],
    takeaways: [
      'Clear hazards and access routes first, then move on to bulky debris and visual cleanup.',
      'Storm cleanup gets easier when hauling, disposal, and yard reset are treated as one job.',
      'Move-out, rental, and listing properties usually need fast post-storm attention.',
    ],
    sections: [
      {
        heading: 'Start with safety and access',
        paragraphs: [
          'After a windstorm, the first priority is not curb appeal. It is access and safety. Clear entry paths, driveways, gates, and walkways so the property is usable again and future work can happen without navigating loose debris.',
          'If branches, sharp material, or unstable piles are in the way, remove those first. This is especially important on rentals, vacant properties, and homes where contractors still need access.',
        ],
      },
      {
        heading: 'Separate light debris from bulky haul-out items',
        paragraphs: [
          'Yard cleanup moves faster when you distinguish between quick baggable debris and the larger material that needs hauling. Leaves, packaging, and loose trash can be cleared fast. Broken furniture, branches, damaged planters, and mixed junk need a different disposal plan.',
          'Once those categories are separated, you can decide whether a trailer, junk pickup, or roll-off setup makes the most sense.',
        ],
        list: [
          'Baggable loose trash and lightweight yard waste',
          'Bulky items that need lifting or hauling',
          'Materials that affect curb appeal the most',
          'Debris blocking parking or walkway access',
        ],
      },
      {
        heading: 'Think beyond the yard itself',
        paragraphs: [
          'Storm cleanup usually exposes other property issues. Overflowing trash areas, dirty entry walks, and exterior maintenance items become more noticeable once the yard is disturbed.',
          'That is why many cleanup jobs turn into a broader reset: haul the debris, wash the hard surfaces, and handle the small repair items that keep the property from looking half-finished.',
        ],
      },
      {
        heading: 'Move fast on rental and listing properties',
        paragraphs: [
          'If the property is turning over to a new tenant or heading to market, yard cleanup should happen quickly. Outdoor disorder changes first impressions immediately, and it can make a property feel unmanaged even when the interior work is nearly done.',
          'Fast cleanup restores control. It also gives you a better sense of what still needs repair, hauling, or washing once the loose debris is gone.',
        ],
      },
    ],
    faq: [
      {
        question: 'What should be removed first after a windstorm?',
        answer:
          'Start with hazards and access blockers like loose branches, scattered sharp debris, and anything preventing entry or parking.',
      },
      {
        question: 'When is a yard cleanup large enough for hauling support?',
        answer:
          'If debris includes bulky items, heavy branches, appliance waste, or multiple waste streams, hauling support usually saves time.',
      },
      {
        question: 'Can yard cleanup be combined with pressure washing?',
        answer:
          'Yes. That sequence often works well once debris is removed and the property is ready for a final exterior reset.',
      },
    ],
  },
  {
    slug: 'small-handyman-upgrades-that-help-el-paso-rentals-lease-faster',
    title: 'Small Handyman Upgrades That Help El Paso Rentals Lease Faster',
    excerpt:
      'Not every rental refresh needs a full remodel. A focused list of small fixes can make a property feel cleaner, tighter, and easier to show.',
    description:
      'These handyman upgrades help El Paso rental properties show better, reduce maintenance friction, and support faster lease-ready turnover.',
    publishedAt: '2026-03-15',
    readingTime: '6 min read',
    coverImage: blogImageAssets.handymanGuide,
    coverAlt: 'Drywall and interior repair work underway for a rental refresh.',
    tags: ['Handyman', 'Rental Turnover', 'Property Maintenance'],
    keywords: [
      'El Paso handyman services',
      'rental turnover repairs',
      'small remodel updates',
      'lease-ready property upgrades',
    ],
    takeaways: [
      'Targeted repairs and finish updates can improve showing quality without a full renovation budget.',
      'Drywall fixes, hardware swaps, fresh fixtures, and cleanup sequencing matter more than flashy changes.',
      'The best turnover results come from combining repairs with hauling and exterior cleanup.',
    ],
    sections: [
      {
        heading: 'Lease-ready does not always mean fully remodeled',
        paragraphs: [
          'A rental can feel dramatically better without a major renovation. In many turnovers, the real issue is not layout or age. It is the accumulation of small defects that make the space look neglected: patched walls that were never finished well, loose hardware, tired fixtures, and unfinished touchups.',
          'That is where focused handyman work matters. Small improvements can tighten the whole impression of a property and reduce the list of distractions a prospective tenant notices during a walkthrough.',
        ],
      },
      {
        heading: 'Prioritize the fixes that show up immediately',
        paragraphs: [
          'Start with the items tenants touch or notice first: doors that stick, damaged trim, tired fixtures, rough drywall patches, and visible paint mismatches. These are not glamorous upgrades, but they change the tone of a showing quickly.',
          'A property feels better maintained when those details are resolved cleanly. That often matters more than chasing a bigger upgrade that leaves smaller defects untouched.',
        ],
        list: [
          'Drywall patching and finish correction',
          'Cabinet and door hardware replacement',
          'Basic lighting and fixture swaps',
          'Trim, caulk, and minor finish touchups',
        ],
      },
      {
        heading: 'Sequence repairs with cleanup and hauling',
        paragraphs: [
          'Repairs are only part of the turnover. If old appliances, leftover junk, yard debris, or dirty exterior surfaces are still in place, the property will not feel ready no matter how many fixtures were updated.',
          'That is why it helps to think in phases: haul out what needs to go, complete the repair list, then finish with cleaning or exterior washing if needed. Each step supports the next.',
        ],
      },
      {
        heading: 'Choose practical upgrades over trendy ones',
        paragraphs: [
          'For many rentals, the best return comes from durability and clarity, not trend chasing. Functional hardware, clean walls, working doors, and a tidy exterior help properties lease because they signal care and reduce uncertainty.',
          'If the property needs more than that, small remodel support can bridge the gap. But the strongest first move is usually to finish the practical basics well.',
        ],
      },
    ],
    faq: [
      {
        question: 'What handyman fixes matter most during a rental turnover?',
        answer:
          'Visible drywall repair, hardware replacement, fixture updates, and minor finish work usually create the fastest improvement.',
      },
      {
        question: 'Should cleanup happen before or after the repair work?',
        answer:
          'Initial haul-out should happen first, then repairs, then final cleaning or pressure washing if the property needs a stronger finished presentation.',
      },
      {
        question: 'When does a small update become a remodel project?',
        answer:
          'When the scope shifts from repairs and swaps into layout changes, multiple finish replacements, or coordinated room refresh work.',
      },
    ],
  },
  {
    slug: 'eviction-cleanout-story-tenant-left-belongings-nightmare',
    title: 'When "Tenant Left Belongings" Turns Into a Full-Blown Horror Movie',
    excerpt:
      'A real-world eviction clean-out story from the Wakala crew. See how we transformed a property from a landlord’s nightmare back into a valuable asset.',
    description:
      'Eviction clean-outs can be overwhelming. Read our latest story on how Wakala handles extreme property recovery and hoarder remediation in El Paso.',
    publishedAt: '2026-03-27',
    readingTime: '7 min read',
    coverImage: blogImageAssets.evictionHorror,
    coverAlt: 'Extreme clutter and debris in a property after an eviction.',
    tags: ['Eviction Cleanup', 'Property Recovery', 'El Paso'],
    keywords: [
      'eviction clean out El Paso',
      'hoarder cleanup services',
      'tenant left belongings help',
      'property restoration cleanout',
    ],
    takeaways: [
      'Landlords often underestimate the scale of a clean-out after a difficult eviction.',
      'Professional property recovery requires a strategy, the right gear, and a fast-acting crew.',
      'A extreme cleanup is the first step toward reclaiming your property value.',
    ],
    sections: [
      {
        heading: 'The Call That Started It All: "It’s Not That Bad"',
        paragraphs: [
          'Every great story in our line of work starts the same way: "Hey… it’s not that bad… just needs a quick clean-out." That’s what the landlord told us over the phone. Five minutes after walking through the front door, we realized we had been lied to.',
          'The floor? Optional—completely hidden under layers of history. The mattress? Questionable, and possibly sentient. The smell? Let’s just say OSHA would’ve been busy filing paperwork.',
        ],
        image: galleryImageAssets.evictionHorror1,
        imageAlt: 'Cluttered bedroom with trash covering the floor.',
      },
      {
        heading: 'The Kitchen: A Crime Scene Against Humanity',
        paragraphs: [
          'If the bedroom was shocking, the kitchen was a crime scene. We found containers of food that had literally evolved, plastic bags within plastic bags, and mysterious liquids we collectively agreed to never identify.',
          'At one point, a crew member asked, "Is that… soup?" We all decided it was better not to know and kept moving. Every job has that moment where you stop reacting and start attacking the problem.',
        ],
        image: galleryImageAssets.evictionHorror2,
        imageAlt: 'Another angle of the extreme clutter and debris.',
      },
      {
        heading: 'Turning Point: From Chaos to Control',
        paragraphs: [
          'Gloves on. Masks up. Trash bags ready. Systems activated. We moved from shock to strategy, from confusion to cleanup mode. Because this isn’t just cleaning—this is hoarder remediation and professional property recovery.',
          'Piece by piece, the transformation started happening. Floors reappeared. Pathways formed. The air became breathable again. And yes—that mattress? Gone forever. One of the guys walked out carrying scrap like a trophy and said, "We’re taking this house back." And we did.',
        ],
        image: galleryImageAssets.evictionHorrorCrew,
        imageAlt: 'Wakala crew member holding reclaimed metal scrap.',
      },
      {
        heading: 'What Landlords Need to Know',
        paragraphs: [
          'Situations like this are more common than people think, especially after evictions. What looks minor over the phone can easily be a full hoarder situation once you’re inside. Delays mean more damage, more cost, and more stress.',
          'This is where professional services matter. We don’t just show up with trash bags; we show up with a plan, a team, and the ability to handle the worst-case scenario. Whether it is eviction cleanup or full restoration prep, we fix it.',
        ],
      },
    ],
    faq: [
      {
        question: 'How fast can Wakala respond to an eviction clean-out?',
        answer:
          'We prioritize property resets to help landlords minimize downtime. Scheduling is often handled same-week once we see the scope.',
      },
      {
        question: 'Do you handle extreme hoarder situations?',
        answer:
          'Yes. We have the equipment and experience to manage hoarder remediation and property recovery projects of all scales.',
      },
      {
        question: 'What happens to all the debris?',
        answer:
          'We use our own roll-off dumpsters and trailers to ensure all debris is removed quickly and disposed of properly.',
      },
    ],
  },
  {
    slug: 'essential-steps-for-a-total-property-reset-in-el-paso',
    title: 'Essential Steps for a Total Property Reset in El Paso',
    excerpt:
      'Whether you are preparing a house for sale, managing a rental turnover, or recovering from a storm, a total property reset restores value and control fast.',
    description:
      'Learn the essential steps for a full property reset in El Paso, from debris removal and yard cleanup to pressure washing and minor repairs.',
    publishedAt: '2026-04-06',
    readingTime: '6 min read',
    coverImage: blogImageAssets.propertyReset,
    coverAlt: 'A property undergoing a professional reset and cleanup.',
    tags: ['Property Reset', 'Cleanup', 'El Paso'],
    keywords: [
      'property reset El Paso',
      'rental turnover cleanup',
      'foreclosure cleanup',
      'estate cleanout help',
    ],
    takeaways: [
      'A property reset is about more than just cleaning; it is about restoring the asset\'s utility and market appeal.',
      'Proper sequencing—starting with big debris and ending with fine cleaning—saves time and money.',
      'Combining hauling, repairs, and washing under one coordinator prevents scheduling gaps.',
    ],
    sections: [
      {
        heading: 'Phase 1: Major Debris and Junk Removal',
        paragraphs: [
          'The first step to any reset is clearing the "big stuff." Whether it is leftover tenant furniture, construction debris, or storm-damaged structures, you cannot see the real condition of the property until the clutter is gone.',
          'Wakala uses 15-yard roll-offs and heavy-duty trailers to clear sites in hours, not days. This phase is about reclaimed space and safety.',
        ],
        image: galleryImageAssets.debrisRemoval,
        imageAlt: 'A large pile of debris being cleared from a residential property.',
      },
      {
        heading: 'Phase 2: Yard and Landscape Restoration',
        paragraphs: [
          'Once the trash is gone, the "green" work begins. In El Paso, wind and sun can make a yard look abandoned in weeks. We focus on overgrowth removal, weed control, and clearing dead vegetation that poses a fire or pest risk.',
          'Cleaning the yard changes the curb appeal immediately, making the property look managed rather than abandoned.',
        ],
        image: galleryImageAssets.yardCleanup,
        imageAlt: 'Professional yard cleanup crew clearing overgrowth and desert landscape.',
      },
      {
        heading: 'Phase 3: Exterior Surface Pressure Washing',
        paragraphs: [
          'Dust and grime are part of life in the desert. A deep pressure wash of the driveway, walkways, and siding removes splotches and buildup that standard cleaning misses.',
          'We target high-visibility areas to ensure that every entry point feels fresh and welcoming to new tenants or buyers.',
        ],
        image: galleryImageAssets.propertyPressureWashing,
        imageAlt: 'Pressure washing a concrete driveway to remove years of dust and stains.',
      },
      {
        heading: 'Phase 4: Targeted Handyman Repairs and Touchups',
        paragraphs: [
          'The final touch is fixing the small things that distract the eye. Drywall patches, fixture swaps, and paint touchups complete the transformation.',
          'By handling these "punch list" items alongside the cleanup, Wakala delivers a property that is truly ready for its next occupant.',
        ],
        image: galleryImageAssets.smallRepairsInterior,
        imageAlt: 'Interior repair work completing the property reset process.',
      },
    ],
    faq: [
      {
        question: 'How long does a full property reset take?',
        answer:
          'Most residential resets are completed in 1–3 days depending on the volume of debris and the number of repairs required.',
      },
      {
        question: 'Can I choose specific phases or do I need the full package?',
        answer:
          'Wakala offers flexible scheduling. You can book just the hauling, just the washing, or the entire end-to-end reset sequence.',
      },
      {
        question: 'Is this service available for commercial properties?',
        answer:
          'Yes, we provide reset services for commercial pad sites, retail storefronts, and rental complexes across El Paso.',
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export const featuredBlogPosts = blogPosts.slice(0, 3);
export const featuredGalleryImages = galleryImages.slice(0, 6);
