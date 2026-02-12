(function () {
  const userSelect = document.getElementById("userSelect");
  const heroGreeting = document.getElementById("heroGreeting");
  const heroUser = document.getElementById("heroUser");
  const profileInitial = document.getElementById("profileInitial");
  const profileBtn = document.getElementById("profileBtn");
  const usageCard = document.getElementById("usageCard");
  const carouselAI = document.getElementById("carouselAI");
  const carouselAJO = document.getElementById("carouselAJO");
  const modalOverlay = document.getElementById("modalOverlay");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalClose = document.getElementById("modalClose");

  let currentUser = null;

  function getOffersInOrder(user, orderKey) {
    var order = user[orderKey];
    if (!order || !order.length) return user.offers.slice();
    return order.map(function (id) { return user.offers.find(function (o) { return o.id === id; }); }).filter(Boolean);
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

  var OFFER_THEMES = {
    tv: { label: "Entertainment" },
    roam: { label: "Roaming" },
    secure: { label: "Security" },
    family: { label: "Family" },
    personal: { label: "For you" },
    data: { label: "Data" },
    sms: { label: "Messaging" }
  };

  function getOfferTheme(offer) {
    var t = offer.theme || "personal";
    return OFFER_THEMES[t] ? t : "personal";
  }

  function getOfferImage(offer) {
    return offer.image || "images/offers/" + (offer.theme || "personal") + ".svg";
  }

  function buildOfferCardHTML(offer) {
    var theme = getOfferTheme(offer);
    var meta = OFFER_THEMES[theme];
    var label = meta ? meta.label : "For you";
    var imgSrc = getOfferImage(offer);
    return (
      '<article class="offer-card" data-offer-id="' + offer.id + '">' +
      '<img class="offer-card-image" src="' + imgSrc + '" alt="" loading="lazy" />' +
      '<div class="offer-card-body">' +
      '<p class="offer-card-category">' + label + '</p>' +
      '<h3>' + offer.title + '</h3>' +
      '<p class="offer-desc">' + offer.shortDesc + '</p>' +
      '<div class="offer-actions">' +
      '<button type="button" class="btn-show-more" data-offer-id="' + offer.id + '">Show more</button>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function renderCarousel(carouselEl, offers, user) {
    if (!carouselEl) return;
    carouselEl.innerHTML = offers.map(buildOfferCardHTML).join("");
    carouselEl.scrollLeft = 0;
    updateCarouselButtons(carouselEl);
    carouselEl.querySelectorAll(".btn-show-more").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var offer = user.offers.find(function (o) { return o.id === btn.dataset.offerId; });
        if (offer) openModal(offer);
      });
    });
  }

  function updateCarouselButtons(carouselEl) {
    if (!carouselEl) return;
    var wrap = carouselEl.closest(".carousel-wrap");
    if (!wrap) return;
    var prevBtn = wrap.querySelector(".carousel-btn-prev");
    var nextBtn = wrap.querySelector(".carousel-btn-next");
    var maxScroll = carouselEl.scrollWidth - carouselEl.clientWidth;
    if (prevBtn) prevBtn.disabled = maxScroll <= 0 || carouselEl.scrollLeft <= 0;
    if (nextBtn) nextBtn.disabled = maxScroll <= 0 || carouselEl.scrollLeft >= maxScroll - 1;
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
    currentUser = ZAPZAP_USERS.find(function (u) { return u.id === userId; });
    if (!currentUser) return;
    updateHero(currentUser);
    renderUsageCard(currentUser);
    renderCarousel(carouselAI, getOffersInOrder(currentUser, "aiOrder"), currentUser);
    renderCarousel(carouselAJO, getOffersInOrder(currentUser, "ajoOrder"), currentUser);
  }

  profileBtn.addEventListener("click", function () {
    userSelect.focus();
    userSelect.click();
  });

  userSelect.addEventListener("change", function () {
    switchUser(Number(this.value));
  });

  document.querySelectorAll(".carousel-wrap").forEach(function (wrap) {
    var car = wrap.querySelector(".carousel");
    if (!car) return;
    var prevBtn = wrap.querySelector(".carousel-btn-prev");
    var nextBtn = wrap.querySelector(".carousel-btn-next");
    if (prevBtn) prevBtn.addEventListener("click", function () { car.scrollBy({ left: -300, behavior: "smooth" }); });
    if (nextBtn) nextBtn.addEventListener("click", function () { car.scrollBy({ left: 300, behavior: "smooth" }); });
    car.addEventListener("scroll", function () { updateCarouselButtons(car); });
  });

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
