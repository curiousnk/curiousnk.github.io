const ZAPZAP_USERS = [
  {
    id: 10001,
    name: "Alex Morgan",
    usage: { dataGB: 12.4, minutes: 340, sms: 28 },
    plan: "Unlimited Plus",
    subscriptions: ["Spotify Premium", "Cloud Storage 50GB"],
    offers: [
      { id: "voor-jou-1", title: "Voor Jou", theme: "personal", image: "images/offers/personal.svg", shortDesc: "Tailored for your usage", fullDescription: "A personalized bundle based on your data and calling patterns. Includes extra data rollover and weekend unlimited calls." },
      { id: "tve-1", title: "TV & Entertainment", theme: "tv", image: "images/offers/tv.svg", shortDesc: "Stream your favorites", fullDescription: "Add TV and streaming to your plan. Access 50+ channels and premium apps. No extra device needed." },
      { id: "roam-1", title: "Roam Easy", theme: "roam", image: "images/offers/roam.svg", shortDesc: "Use abroad like at home", fullDescription: "Use your minutes, data and SMS in 40+ countries at no extra cost. Ideal for your travel habits." },
      { id: "family-1", title: "Family Plus", theme: "family", image: "images/offers/family.svg", shortDesc: "Share with up to 5", fullDescription: "One bill for the whole family. Share data and get discounts on additional lines." },
      { id: "secure-1", title: "Secure Net", theme: "secure", image: "images/offers/secure.svg", shortDesc: "VPN and identity protection", fullDescription: "Browse safely on any network. Includes VPN and basic identity monitoring." }
    ],
    aiOrder: ["voor-jou-1", "tve-1", "roam-1", "family-1", "secure-1"],
    ajoOrder: ["tve-1", "roam-1", "secure-1", "voor-jou-1", "family-1"]
  },
  {
    id: 10002,
    name: "Jordan Lee",
    usage: { dataGB: 2.1, minutes: 890, sms: 120 },
    plan: "Talk More 500",
    subscriptions: ["None"],
    offers: [
      { id: "tve-2", title: "TV & Entertainment", theme: "tv", image: "images/offers/tv.svg", shortDesc: "Stream your favorites", fullDescription: "Add TV and streaming to your plan. Access 50+ channels and premium apps." },
      { id: "voor-jou-2", title: "Voor Jou", theme: "personal", image: "images/offers/personal.svg", shortDesc: "More minutes, less worry", fullDescription: "We noticed you love to talk. This offer gives you extra minutes and unlimited weekend calls." },
      { id: "roam-2", title: "Roam Easy", theme: "roam", image: "images/offers/roam.svg", shortDesc: "Use abroad like at home", fullDescription: "Use your plan in 40+ countries. Perfect for occasional travelers." },
      { id: "data-bump-2", title: "Data Bump", theme: "data", image: "images/offers/data.svg", shortDesc: "Extra 5GB when you need it", fullDescription: "One-time or recurring data top-up. No contract change." }
    ],
    aiOrder: ["voor-jou-2", "data-bump-2", "tve-2", "roam-2"],
    ajoOrder: ["tve-2", "roam-2", "voor-jou-2", "data-bump-2"]
  },
  {
    id: 10003,
    name: "Sam Chen",
    usage: { dataGB: 45.2, minutes: 45, sms: 12 },
    plan: "Data Max",
    subscriptions: ["Spotify Premium", "YouTube Premium", "Cloud Storage 200GB"],
    offers: [
      { id: "voor-jou-3", title: "Voor Jou", theme: "personal", image: "images/offers/personal.svg", shortDesc: "Data-first experience", fullDescription: "Optimized for heavy data users. Priority speed and unlimited social data." },
      { id: "secure-3", title: "Secure Net", theme: "secure", image: "images/offers/secure.svg", shortDesc: "VPN and identity protection", fullDescription: "Essential for public Wi‑Fi. VPN and identity monitoring included." },
      { id: "tve-3", title: "TV & Entertainment", theme: "tv", image: "images/offers/tv.svg", shortDesc: "Stream without limits", fullDescription: "Watch on the go with zero-rated streaming on selected apps." },
      { id: "family-3", title: "Family Plus", theme: "family", image: "images/offers/family.svg", shortDesc: "Share data with family", fullDescription: "One plan, multiple lines. Shared data pool and family discounts." }
    ],
    aiOrder: ["voor-jou-3", "tve-3", "secure-3", "family-3"],
    ajoOrder: ["secure-3", "tve-3", "family-3", "voor-jou-3"]
  },
  {
    id: 10004,
    name: "Riley Davis",
    usage: { dataGB: 8.0, minutes: 180, sms: 450 },
    plan: "Value Bundle",
    subscriptions: ["Cloud Storage 50GB"],
    offers: [
      { id: "sms-pack-4", title: "SMS Pack", theme: "sms", image: "images/offers/sms.svg", shortDesc: "More texts, one price", fullDescription: "Unlimited SMS to all national numbers. Great for your messaging habits." },
      { id: "voor-jou-4", title: "Voor Jou", theme: "personal", image: "images/offers/personal.svg", shortDesc: "Built for texters", fullDescription: "A package designed around your SMS usage with unlimited social messaging." },
      { id: "tve-4", title: "TV & Entertainment", theme: "tv", image: "images/offers/tv.svg", shortDesc: "Add TV to your bundle", fullDescription: "Upgrade your bundle with TV and streaming. One bill, more value." },
      { id: "roam-4", title: "Roam Easy", theme: "roam", image: "images/offers/roam.svg", shortDesc: "Use abroad like at home", fullDescription: "Take your plan with you in 40+ countries." }
    ],
    aiOrder: ["voor-jou-4", "sms-pack-4", "tve-4", "roam-4"],
    ajoOrder: ["sms-pack-4", "tve-4", "roam-4", "voor-jou-4"]
  },
  {
    id: 10005,
    name: "Casey Brown",
    usage: { dataGB: 22.0, minutes: 520, sms: 85 },
    plan: "All-in-One Pro",
    subscriptions: ["Spotify Premium", "TV Basic", "Secure Net"],
    offers: [
      { id: "tve-5", title: "TV & Entertainment Upgrade", theme: "tv", image: "images/offers/tv.svg", shortDesc: "Go premium", fullDescription: "Upgrade from TV Basic to full TV & Entertainment. More channels and 4K." },
      { id: "roam-5", title: "Roam Easy", theme: "roam", image: "images/offers/roam.svg", shortDesc: "Use abroad like at home", fullDescription: "You have Secure Net; add Roam Easy for worry-free travel in 40+ countries." },
      { id: "family-5", title: "Family Plus", theme: "family", image: "images/offers/family.svg", shortDesc: "Add a line", fullDescription: "Add another line to your account with shared data and a discount." }
    ],
    aiOrder: ["tve-5", "family-5", "roam-5"],
    ajoOrder: ["roam-5", "tve-5", "family-5"]
  }
];
