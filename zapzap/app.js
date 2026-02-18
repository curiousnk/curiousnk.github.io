(function () {
  const BASE_URL = "web://curiousnk.github.io/weather/index.html";
  const CAROUSEL_SURFACES = [
    BASE_URL + "#offerContainer",
    BASE_URL + "#offerContainerPriority",
    BASE_URL + "#offerContainerAutoAI"
  ];
  const CAROUSEL_CONTAINER_IDS = ["offerContainerRanking", "offerContainerPriority", "offerContainerAutoAI"];
  const CUSTOM_AI_CONTAINER_ID = "offerContainerCustomAI";
  // Map proposition scope (surface URL) to container ID: #offerContainer = ranking, etc.
  const SCOPE_TO_CONTAINER = {
    [BASE_URL + "#offerContainer"]: "offerContainerRanking",
    [BASE_URL + "#offerContainerPriority"]: "offerContainerPriority",
    [BASE_URL + "#offerContainerAutoAI"]: "offerContainerAutoAI"
  };
  // Only send propositionDisplay / propositionInteract for AI model training on this carousel
  const AI_MODEL_CAROUSEL_CONTAINER_ID = "offerContainerAutoAI";

  const heroGreeting = document.getElementById("heroGreeting");
  const heroUser = document.getElementById("heroUser");
  const profileInitial = document.getElementById("profileInitial");
  const profileBtn = document.getElementById("profileBtn");
  const userSelect = document.getElementById("userSelect");
  const dashboardCards = document.getElementById("dashboardCards");
  let currentUser = null;
  window.carouselPropositions = {};

  function waitForAlloy(callback, interval, retries) {
    interval = interval || 100;
    retries = retries || 50;
    if (typeof alloy === "function") {
      callback();
    } else if (retries > 0) {
      setTimeout(function () { waitForAlloy(callback, interval, retries - 1); }, interval);
    } else {
      console.error("Alloy is not available.");
    }
  }

  function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html || "";
    return txt.value;
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }

  function getInitials(name) {
    return name.split(" ").map(function (s) { return s.charAt(0); }).join("").toUpperCase().slice(0, 2);
  }

  function shortName(name) {
    var parts = name.split(" ");
    if (parts.length >= 2) return parts[0].charAt(0) + ". " + parts[1];
    return name;
  }

  function updateHero(user) {
    if (heroGreeting) heroGreeting.textContent = getGreeting();
    if (heroUser) heroUser.textContent = shortName(user.name);
    if (profileInitial) profileInitial.textContent = getInitials(user.name);
  }

  function renderDashboard(user) {
    if (!dashboardCards) return;
    var planLabel = user.planLabel || user.planType || "—";
    var dataUsed = user.dataUsedGB != null ? user.dataUsedGB + " GB" : "—";
    var dataLimit = user.dataLimitGB != null ? user.dataLimitGB + " GB" : "Unlimited";
    var dataText = user.dataUsedGB != null ? dataUsed + " of " + dataLimit + " used" : "—";
    var hasMinutes = user.minutesUsed != null || user.minutesLimit != null;
    var minutesText = hasMinutes
      ? (user.minutesUsed != null ? user.minutesUsed + " min" : "0 min") + " of " + (user.minutesLimit != null ? user.minutesLimit + " min" : "Unlimited") + " used"
      : "Not included";
    var hasSms = user.smsUsed != null || user.smsLimit != null;
    var smsText = hasSms
      ? (user.smsUsed != null ? user.smsUsed : "0") + " of " + (user.smsLimit != null ? user.smsLimit : "Unlimited") + " used"
      : "Not included";
    dashboardCards.innerHTML =
      '<div class="dashboard-card usage-card">' +
        '<div class="usage-card-icon">📱</div>' +
        '<div class="usage-card-main">' +
          '<p class="usage-card-label">Current plan</p>' +
          '<p class="usage-card-value">' + planLabel + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="dashboard-card usage-card">' +
        '<div class="usage-card-icon">📶</div>' +
        '<div class="usage-card-main">' +
          '<p class="usage-card-label">Data this period</p>' +
          '<p class="usage-card-value">' + dataText + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="dashboard-card usage-card">' +
        '<div class="usage-card-icon">📞</div>' +
        '<div class="usage-card-main">' +
          '<p class="usage-card-label">Minutes</p>' +
          '<p class="usage-card-value">' + minutesText + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="dashboard-card usage-card">' +
        '<div class="usage-card-icon">💬</div>' +
        '<div class="usage-card-main">' +
          '<p class="usage-card-label">SMS</p>' +
          '<p class="usage-card-value">' + smsText + '</p>' +
        '</div>' +
      '</div>';
  }

  function renderUserOptions() {
    if (!userSelect || typeof ZAPZAP_USERS === "undefined") return;
    userSelect.innerHTML = ZAPZAP_USERS.map(function (u) {
      return '<option value="' + u.id + '">' + u.name + '</option>';
    }).join("");
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

  function getTokensFromProposition(proposition) {
    var tokensByIndex = [];
    try {
      if (proposition.scopeDetails && proposition.scopeDetails.characteristics && proposition.scopeDetails.characteristics.subPropositions) {
        var decoded = atob(proposition.scopeDetails.characteristics.subPropositions);
        var subProps = JSON.parse(decoded);
        if (Array.isArray(subProps) && subProps.length > 0) {
          subProps.forEach(function (subProp) {
            if (subProp.items && Array.isArray(subProp.items)) {
              subProp.items.forEach(function (subItem) {
                if (subItem.token) tokensByIndex.push(subItem.token);
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to decode subPropositions:", e);
    }
    return tokensByIndex;
  }

  /** Returns [{ id, token }, ...] from proposition.scopeDetails.characteristics.subPropositions (by index). */
  function getOfferIdsAndTokensFromProposition(proposition) {
    var list = [];
    try {
      if (proposition.scopeDetails && proposition.scopeDetails.characteristics && proposition.scopeDetails.characteristics.subPropositions) {
        var decoded = atob(proposition.scopeDetails.characteristics.subPropositions);
        var subProps = JSON.parse(decoded);
        if (Array.isArray(subProps) && subProps.length > 0) {
          subProps.forEach(function (subProp) {
            if (subProp.items && Array.isArray(subProp.items)) {
              subProp.items.forEach(function (subItem) {
                list.push({
                  id: subItem.id || null,
                  token: subItem.token || null
                });
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn("Failed to decode subPropositions:", e);
    }
    return list;
  }

  function renderPropositionIntoContainer(containerEl, proposition, containerId) {
    if (!containerEl) return;
    containerEl.innerHTML = "";
    window.carouselPropositions[containerId] = proposition;
    var allOffers = proposition.items || [];
    if (!allOffers.length) {
      containerEl.innerHTML = "<p class=\"carousel-message\">No offers returned.</p>";
      updateCarouselButtons(containerEl);
      return;
    }
    var tokensByIndex = getTokensFromProposition(proposition);
    var idsAndTokens = getOfferIdsAndTokensFromProposition(proposition);
    var propositionForEvents = [proposition];
    var isAIModelCarousel = containerId === AI_MODEL_CAROUSEL_CONTAINER_ID;
    var impressionItems = isAIModelCarousel ? idsAndTokens.filter(function (x) { return x.id && x.token; }) : [];
    var offerIndex = 0;
    allOffers.forEach(function (item, itemIndex) {
      var offerId = item.id;
      var trackingToken = tokensByIndex[itemIndex] || item.token;
      var decoded = decodeHtml(item.data && item.data.content ? item.data.content : "");
      var tempDiv = document.createElement("div");
      tempDiv.innerHTML = decoded;
      [].slice.call(tempDiv.children).forEach(function (child) {
        if (child.classList.contains("offer-item")) {
          if (isAIModelCarousel && idsAndTokens[offerIndex]) {
            child.setAttribute("data-offer-id", idsAndTokens[offerIndex].id);
            child.setAttribute("data-tracking-token", idsAndTokens[offerIndex].token);
            offerIndex++;
          }
          containerEl.appendChild(child);
        }
      });
    });
    containerEl.scrollLeft = 0;
    updateCarouselButtons(containerEl);
    if (isAIModelCarousel) {
      var ecidValue = getECID();
      if (ecidValue && impressionItems.length > 0) {
        impressionItems.forEach(function (_ref) {
          var id = _ref.id, token = _ref.token;
          if (!id || !token) return;
          alloy("sendEvent", {
            xdm: {
              _id: generateUUID(),
              timestamp: new Date().toISOString(),
              eventType: "decisioning.propositionDisplay",
              identityMap: { ECID: [{ id: ecidValue, authenticatedState: "ambiguous", primary: true }] },
              _experience: {
                decisioning: {
                  propositionEventType: { display: 1 },
                  propositionAction: { id: id, tokens: [token] },
                  propositions: propositionForEvents
                }
              }
            }
          });
        });
      }
    }
  }

  function requestOffers(user) {
    if (typeof alloy !== "function") return;
    var i, containerEl;
    for (i = 0; i < CAROUSEL_CONTAINER_IDS.length; i++) {
      containerEl = document.getElementById(CAROUSEL_CONTAINER_IDS[i]);
      if (containerEl) containerEl.innerHTML = "<p class=\"carousel-message\">Loading…</p>";
    }
    containerEl = document.getElementById(CUSTOM_AI_CONTAINER_ID);
    if (containerEl) containerEl.innerHTML = "<p class=\"carousel-message\">Coming soon</p>";
    document.querySelectorAll(".carousel-wrap").forEach(function (wrap) {
      var car = wrap.querySelector(".carousel");
      if (car) updateCarouselButtons(car);
    });

    alloy("sendEvent", {
      renderDecisions: true,
      personalization: { surfaces: CAROUSEL_SURFACES },
      xdm: {
        eventType: "decisioning.request",
        _psc: {
          id: user.id,
          temperature: user.temperature,
          planType: user.planType,
          weatherConditions: user.weatherConditions,
          cityName: user.cityName
        }
      }
    }).then(function (response) {
      window.latestPropositions = response.propositions || [];
      var renderedContainerIds = {};
      (response.propositions || []).forEach(function (proposition) {
        var scope = proposition.scope || (proposition.scopeDetails && proposition.scopeDetails.name);
        var containerId = scope ? SCOPE_TO_CONTAINER[scope] : null;
        if (!containerId) return;
        containerEl = document.getElementById(containerId);
        if (containerEl) {
          renderPropositionIntoContainer(containerEl, proposition, containerId);
          renderedContainerIds[containerId] = true;
        }
      });
      CAROUSEL_CONTAINER_IDS.forEach(function (id) {
        if (renderedContainerIds[id]) return;
        containerEl = document.getElementById(id);
        if (containerEl) {
          containerEl.innerHTML = "<p class=\"carousel-message\">No offers returned.</p>";
          updateCarouselButtons(containerEl);
        }
      });
      containerEl = document.getElementById(CUSTOM_AI_CONTAINER_ID);
      if (containerEl) {
        containerEl.innerHTML = "<p class=\"carousel-message\">Coming soon</p>";
        updateCarouselButtons(containerEl);
      }
    }).catch(function (err) {
      console.error("Personalization failed:", err);
      for (i = 0; i < CAROUSEL_CONTAINER_IDS.length; i++) {
        containerEl = document.getElementById(CAROUSEL_CONTAINER_IDS[i]);
        if (containerEl) {
          containerEl.innerHTML = "<p class=\"carousel-message\">No offers returned.</p>";
          updateCarouselButtons(containerEl);
        }
      }
    });
  }

  function switchUser(userId) {
    var user = ZAPZAP_USERS.filter(function (u) { return String(u.id) === String(userId); })[0];
    if (!user) return;
    currentUser = user;
    updateHero(currentUser);
    renderDashboard(currentUser);
    if (typeof alloy === "function") {
      requestOffers(currentUser);
    } else {
      CAROUSEL_CONTAINER_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = "<p class=\"carousel-message\">Loading…</p>";
      });
    }
  }

  function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, function (c) {
      var r = (typeof crypto !== "undefined" && crypto.getRandomValues)
        ? crypto.getRandomValues(new Uint8Array(1))[0] & 15
        : (Math.random() * 16) | 0;
      return (parseInt(c, 10) ^ r).toString(16);
    });
  }

  function getECID() {
    try {
      return typeof _satellite !== "undefined" && _satellite.getVar ? _satellite.getVar("ECID") : null;
    } catch (e) {
      return null;
    }
  }

  renderUserOptions();
  currentUser = ZAPZAP_USERS && ZAPZAP_USERS[0] ? ZAPZAP_USERS[0] : null;
  if (currentUser) {
    updateHero(currentUser);
    renderDashboard(currentUser);
  }

  if (profileBtn) profileBtn.addEventListener("click", function () {
    if (userSelect) { userSelect.focus(); userSelect.click(); }
  });
  if (userSelect) userSelect.addEventListener("change", function () {
    switchUser(this.value);
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

  var offerModal = document.getElementById("offerModal");
  var modalBody = document.getElementById("modalBody");
  var modalClose = document.getElementById("modalClose");
  document.addEventListener("click", function (e) {
    if (e.target.closest(".btn-show-more")) {
      var card = e.target.closest(".offer-item");
      if (card && modalBody) {
        var autoAIContainer = document.getElementById(AI_MODEL_CAROUSEL_CONTAINER_ID);
        if (autoAIContainer && autoAIContainer.contains(card)) {
          var offerId = card.getAttribute("data-offer-id");
          var trackingToken = card.getAttribute("data-tracking-token");
          var proposition = window.carouselPropositions && window.carouselPropositions[AI_MODEL_CAROUSEL_CONTAINER_ID];
          var ecidValue = getECID();
          if (ecidValue && offerId && trackingToken && proposition) {
            console.log("AI Ranking even for auto model", offerId, trackingToken, proposition);  
             alloy("sendEvent", {
               xdm: {
                 _id: generateUUID(),
                 timestamp: new Date().toISOString(),
                 eventType: "decisioning.propositionInteract",
                 identityMap: { ECID: [{ id: ecidValue, authenticatedState: "ambiguous", primary: true }] },
                 _experience: {
                   decisioning: {
                     propositionEventType: { interact: 1 },
                     propositionAction: { id: offerId, tokens: [trackingToken] },
                     propositions: [proposition]
                   }
                 }
               }
             });
           }
        }
        modalBody.innerHTML = "";
        modalBody.appendChild(card.querySelector(".offer-card").cloneNode(true));
        if (offerModal) { offerModal.classList.add("is-open"); offerModal.setAttribute("aria-hidden", "false"); }
      }
    }
  });
  function closeModal() {
    if (offerModal) { offerModal.classList.remove("is-open"); offerModal.setAttribute("aria-hidden", "true"); }
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (offerModal) offerModal.addEventListener("click", function (e) { if (e.target === offerModal) closeModal(); });

  waitForAlloy(function () {
    if (currentUser) requestOffers(currentUser);
  });
})();
