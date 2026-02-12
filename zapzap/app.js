(function () {
  const userSelect = document.getElementById("userSelect");
  const heroGreeting = document.getElementById("heroGreeting");
  const heroUser = document.getElementById("heroUser");
  const profileInitial = document.getElementById("profileInitial");
  const profileBtn = document.getElementById("profileBtn");
  const usageCard = document.getElementById("usageCard");
  const carousel = document.getElementById("carousel");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");
  const btnPrev = document.querySelector(".carousel-btn-prev");
  const btnNext = document.querySelector(".carousel-btn-next");

  let currentUser = null;
  const dismissedByUser = {};

  function getDismissed(userId) {
    return dismissedByUser[userId] || new Set();
  }

  function setDismissed(userId, offerId) {
    if (!dismissedByUser[userId]) dismissedByUser[userId] = new Set();
    dismissedByUser[userId].add(offerId);
  }

  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((s) => s.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function shortName(name) {
    const parts = name.split(" ");
    if (parts.length >= 2) return parts[0].charAt(0) + ". " + parts[1];
    return name;
  }

  function renderUserOptions() {
    userSelect.innerHTML = ZAPZAP_USERS.map(
      (u) => `<option value="${u.id}">${u.name}</option>`
    ).join("");
  }

  function updateHero(user) {
    heroGreeting.textContent = getGreeting();
    heroUser.textContent = shortName(user.name);
    profileInitial.textContent = getInitials(user.name);
  }

  function renderUsageCard(user) {
    const u = user.usage;
    const planLabel = user.plan.indexOf("Unlimited") !== -1
      ? "Unlimited Calls and SMS"
      : user.plan + " • Calls & SMS";
    usageCard.innerHTML =
      '<div class="usage-card-icon">📱</div>' +
      '<div class="usage-card-main">' +
      '<p class="usage-card-label">Mobile</p>' +
      '<p class="usage-card-value">' + u.dataGB + ' GB used</p>' +
      '<p class="usage-card-plan">' + planLabel + ' <span aria-hidden="true">∞</span></p>' +
      '</div>' +
      '<div class="usage-card-days">30 days</div>';
  }

  function offerImageUrl(offerId) {
    return "https://picsum.photos/seed/" + encodeURIComponent(offerId) + "/400/220";
  }

  function renderCarousel(user) {
    const dismissed = getDismissed(user.id);
    const visibleOffers = user.offers.filter((o) => !dismissed.has(o.id));
    carousel.innerHTML = visibleOffers
      .map((offer) => {
        const imgUrl = offer.imageUrl || offerImageUrl(offer.id);
        return (
          '<article class="offer-card" data-offer-id="' + offer.id + '">' +
          '<img class="offer-card-image" src="' + imgUrl + '" alt="" loading="lazy" />' +
          '<div class="offer-card-body">' +
          '<p class="offer-card-category">Entertainment</p>' +
          '<h3>' + offer.title + '</h3>' +
          '<p class="offer-desc">' + offer.shortDesc + '</p>' +
          '<div class="offer-actions">' +
          '<button type="button" class="btn-show-more" data-offer-id="' + offer.id + '">Show more</button>' +
          '<button type="button" class="btn-dismiss" data-offer-id="' + offer.id + '">Dismiss</button>' +
          '</div>' +
          '</div>' +
          '</article>'
        );
      })
      .join("");

    carousel.scrollLeft = 0;
    updateCarouselButtons();

    carousel.querySelectorAll(".btn-show-more").forEach((btn) => {
      btn.addEventListener("click", function () {
        const offer = user.offers.find((o) => o.id === this.dataset.offerId);
        if (offer) openModal(offer);
      });
    });
    carousel.querySelectorAll(".btn-dismiss").forEach((btn) => {
      btn.addEventListener("click", function () {
        const offerId = this.dataset.offerId;
        setDismissed(user.id, offerId);
        const card = carousel.querySelector("[data-offer-id=\"" + offerId + "\"]");
        if (card) card.classList.add("dismissed");
      });
    });
  }

  function updateCarouselButtons() {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    btnPrev.disabled = maxScroll <= 0 || carousel.scrollLeft <= 0;
    btnNext.disabled = maxScroll <= 0 || carousel.scrollLeft >= maxScroll - 1;
  }

  function openModal(offer) {
    modalTitle.textContent = offer.title;
    modalBody.textContent = offer.fullDescription;
    modalOverlay.hidden = false;
    modalClose.focus();
  }

  function closeModal() {
    modalOverlay.hidden = true;
  }

  function switchUser(userId) {
    currentUser = ZAPZAP_USERS.find((u) => u.id === userId);
    if (!currentUser) return;
    updateHero(currentUser);
    renderUsageCard(currentUser);
    renderCarousel(currentUser);
  }

  profileBtn.addEventListener("click", function () {
    userSelect.focus();
    userSelect.click();
  });

  userSelect.addEventListener("change", function () {
    switchUser(this.value);
  });

  btnPrev.addEventListener("click", function () {
    carousel.scrollBy({ left: -300, behavior: "smooth" });
  });
  btnNext.addEventListener("click", function () {
    carousel.scrollBy({ left: 300, behavior: "smooth" });
  });
  carousel.addEventListener("scroll", updateCarouselButtons);

  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.hidden) closeModal();
  });

  renderUserOptions();
  switchUser(ZAPZAP_USERS[0].id);
})();
