// Type definitions (for reference)
// type DemoUser = { id: string; label: string };
// type Offer = { offerId: string; title: string; description: string; category: string; imageUrl: string };
// type InteractionType = "offerClicked" | "offerDismissed";
// type Interaction = { userId: string; offerId: string; interactionType: InteractionType; timestamp: string };

// Demo Users
const DEMO_USERS = [
    { id: "10000001", label: "Joost – heavy data user" },
    { id: "10000002", label: "Anouk – streaming/TV" },
    { id: "10000003", label: "Mark – value seeker" },
    { id: "10000004", label: "Sanne – neutral" },
    { id: "10000005", label: "Lars – mobile data" }
];

// Helper function to create a simple data URI placeholder
function createPlaceholderImage(text, color = "#4a90e2") {
    // Simple SVG as data URI
    const svg = `<svg width="300" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="300" height="150" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">${text}</text>
    </svg>`;
    return "data:image/svg+xml;base64," + btoa(svg);
}

// Offers array
const OFFERS = [
    {
        offerId: "offer001",
        title: "Unlimited Data Plan",
        description: "Get unlimited high-speed data for all your streaming and browsing needs.",
        category: "Data",
        imageUrl: createPlaceholderImage("Unlimited Data", "#28a745")
    },
    {
        offerId: "offer002",
        title: "Premium TV Package",
        description: "Access to 200+ channels including sports, movies, and international content.",
        category: "Entertainment",
        imageUrl: createPlaceholderImage("Premium TV", "#dc3545")
    },
    {
        offerId: "offer003",
        title: "Family Bundle Deal",
        description: "Save 20% with our family bundle - perfect for value seekers.",
        category: "Bundle",
        imageUrl: createPlaceholderImage("Family Bundle", "#ffc107")
    },
    {
        offerId: "offer004",
        title: "5G Mobile Upgrade",
        description: "Upgrade to 5G and experience lightning-fast mobile internet speeds.",
        category: "Mobile",
        imageUrl: createPlaceholderImage("5G Mobile", "#17a2b8")
    },
    {
        offerId: "offer005",
        title: "Smart Home Package",
        description: "Connect your home with our smart home solutions and IoT devices.",
        category: "IoT",
        imageUrl: createPlaceholderImage("Smart Home", "#6f42c1")
    }
];

// --- AJO decisioning integration (plug-and-play) ---

/**
 * Fetch offers for a given user ID from AJO decisioning.
 * This is the ONLY function you need to customize for your environment.
 *
 * @param {string|null} userId
 * @returns {Promise<Offer[]>}
 */
async function fetchOffersForUser(userId) {
    // If no user is selected, you can decide:
    // - return empty array, or
    // - return default static offers.
    if (!userId) {
        return [...OFFERS]; // fallback to local demo offers
    }

    try {
        // EXAMPLE: replace this URL and headers with your actual AJO / Edge endpoint
        const response = await fetch("/api/ajo/offers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
                // e.g. add auth here if your backend proxy needs it
                // "Authorization": "Bearer <token>",
                // "x-api-key": "<your-api-key>"
            },
            body: JSON.stringify({
                identity: {
                    // You can align this with your AJO identity namespace
                    namespace: "TelcoCoID",
                    id: userId
                },
                context: {
                    channel: "web"
                }
            })
        });

        if (!response.ok) {
            console.error("AJO offers call failed:", response.status, response.statusText);
            // graceful fallback – keep the demo working
            return [...OFFERS];
        }

        const data = await response.json();

        // Map AJO response -> Offer[]
        // Adjust this mapping to match your actual AJO payload shape.
        // For example, if the AJO response looks like:
        // { propositions: [ { id, name, description, category, imageUrl }, ... ] }
        const offers = (data.propositions || []).map(p => ({
            offerId: p.id,
            title: p.name,
            description: p.description || "",
            category: p.category || "Unknown",
            imageUrl: p.imageUrl || createPlaceholderImage(p.name || "Offer", "#4a90e2")
        }));

        // If AJO returns nothing, fallback to static offers so the demo doesn't look broken
        return offers.length > 0 ? offers : [...OFFERS];
    } catch (err) {
        console.error("Error calling AJO decisioning:", err);
        return [...OFFERS]; // graceful fallback
    }
}

// Application state
let currentUserId = null;
let visibleOffers = [...OFFERS];
let interactions = [];

// DOM elements
const userDropdown = document.getElementById("userDropdown");
const currentUserIdDisplay = document.getElementById("currentUserId");
const offersContainer = document.getElementById("offersContainer");
const logPanel = document.getElementById("logPanel");
const reloadBtn = document.getElementById("reloadBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// Initialize dropdown
function initializeDropdown() {
    DEMO_USERS.forEach(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.label;
        userDropdown.appendChild(option);
    });
}

// Handle user selection
userDropdown.addEventListener("change", async (e) => {
    currentUserId = e.target.value || null;
    updateCurrentUserIdDisplay();

    // If no user selected, either clear or show defaults
    if (!currentUserId) {
        visibleOffers = [...OFFERS];
        renderOffers();
        return;
    }

    // Fetch offers from AJO for the selected user
    visibleOffers = await fetchOffersForUser(currentUserId);
    renderOffers();
});

// Update current user ID display
function updateCurrentUserIdDisplay() {
    if (currentUserId) {
        currentUserIdDisplay.textContent = `Current TelcoCo ID: ${currentUserId}`;
    } else {
        currentUserIdDisplay.textContent = "";
    }
}

// Create offer card element
function createOfferCard(offer) {
    const card = document.createElement("div");
    card.className = "offer-card";
    card.dataset.offerId = offer.offerId;

    const fallbackImage = createPlaceholderImage("No Image", "#6c757d");
    card.innerHTML = `
        <img src="${offer.imageUrl}" alt="${offer.title}" onerror="this.src='${fallbackImage}'">
        <h3>${offer.title}</h3>
        <div class="category">${offer.category}</div>
        <div class="description">${offer.description}</div>
        <div class="buttons">
            <button class="select-btn" onclick="handleSelect('${offer.offerId}')">Select</button>
            <button class="dismiss-btn" onclick="handleDismiss('${offer.offerId}')">Dismiss</button>
        </div>
    `;

    return card;
}

// Render offers
function renderOffers() {
    offersContainer.innerHTML = "";
    visibleOffers.forEach(offer => {
        const card = createOfferCard(offer);
        offersContainer.appendChild(card);
    });
    updateCarouselButtons();
}

// Carousel navigation
function scrollCarousel(direction) {
    const cardWidth = 280 + 20; // card width + gap
    const scrollAmount = cardWidth;
    const currentScroll = offersContainer.scrollLeft;
    
    if (direction === 'next') {
        offersContainer.scrollTo({
            left: currentScroll + scrollAmount,
            behavior: 'smooth'
        });
    } else {
        offersContainer.scrollTo({
            left: currentScroll - scrollAmount,
            behavior: 'smooth'
        });
    }
    
    // Update button states after scroll
    setTimeout(updateCarouselButtons, 300);
}

function updateCarouselButtons() {
    const container = offersContainer;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    prevBtn.disabled = container.scrollLeft <= 0;
    nextBtn.disabled = container.scrollLeft >= maxScroll - 1; // -1 for rounding
}

// Carousel button handlers
prevBtn.addEventListener("click", () => scrollCarousel('prev'));
nextBtn.addEventListener("click", () => scrollCarousel('next'));

// Update button states on scroll
offersContainer.addEventListener("scroll", updateCarouselButtons);

// Handle Select button click
function handleSelect(offerId) {
    if (!currentUserId) {
        alert("Please select a user first");
        return;
    }

    const interaction = {
        userId: currentUserId,
        offerId: offerId,
        interactionType: "offerClicked",
        timestamp: new Date().toISOString()
    };

    interactions.push(interaction);
    updateLogPanel();
    console.log(`[${interaction.userId}] ${interaction.interactionType} ${interaction.offerId} ${interaction.timestamp}`);
}

// Handle Dismiss button click
function handleDismiss(offerId) {
    if (!currentUserId) {
        alert("Please select a user first");
        return;
    }

    const interaction = {
        userId: currentUserId,
        offerId: offerId,
        interactionType: "offerDismissed",
        timestamp: new Date().toISOString()
    };

    interactions.push(interaction);
    
    // Remove offer from visible list
    visibleOffers = visibleOffers.filter(offer => offer.offerId !== offerId);
    
    renderOffers();
    updateLogPanel();
    console.log(`[${interaction.userId}] ${interaction.interactionType} ${interaction.offerId} ${interaction.timestamp}`);
}

// Reload offers
reloadBtn.addEventListener("click", async () => {
    // If no userId, keep using local demo data
    if (!currentUserId) {
        visibleOffers = [...OFFERS];
    } else {
        visibleOffers = await fetchOffersForUser(currentUserId);
    }
    renderOffers();
});

// Update log panel
function updateLogPanel() {
    // Sort interactions in reverse chronological order (newest first)
    const sortedInteractions = [...interactions].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    logPanel.textContent = sortedInteractions.map(interaction => 
        `[${interaction.userId}] ${interaction.interactionType} ${interaction.offerId} ${interaction.timestamp}`
    ).join("\n");
}

// Initialize app
function init() {
    initializeDropdown();
    renderOffers();
    updateCarouselButtons();
}

// Make functions globally accessible for onclick handlers
window.handleSelect = handleSelect;
window.handleDismiss = handleDismiss;

// Start app
init();
