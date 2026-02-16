(function () {
  const SURFACE = "web://curiousnk.github.io/index.html#offerContainer";
  const heroGreeting = document.getElementById("heroGreeting");
  const heroUser = document.getElementById("heroUser");
  const profileInitial = document.getElementById("profileInitial");
  const profileBtn = document.getElementById("profileBtn");
  const userSelect = document.getElementById("userSelect");
  const usageCard = document.getElementById("usageCard");
  const offerContainer = document.getElementById("offerContainer");

  let currentUser = null;

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

  function renderUsageCard(user) {
    if (!usageCard) return;
    usageCard.innerHTML =
      '<div class="usage-card-icon">🌤️</div>' +
      '<div class="usage-card-main">' +
      '<p class="usage-card-label">Your weather</p>' +
      '<p class="usage-card-value">' + user.temperature + '°F, ' + user.weatherConditions + '</p>' +
      '<p class="usage-card-plan">' + user.cityName + '</p>' +
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

  function requestOffers(user) {
    if (!offerContainer || typeof alloy !== "function") return;
    offerContainer.innerHTML = "<p class=\"carousel-message\">Loading…</p>";
    updateCarouselButtons(offerContainer);

    alloy("sendEvent", {
      renderDecisions: true,
      personalization: { surfaces: [SURFACE] },
      xdm: {
        eventType: "decisioning.request",
        _psc: {
          userId: user.id,
          temperature: user.temperature,
          weatherConditions: user.weatherConditions,
          cityName: user.cityName
        }
      }
    }).then(function (response) {
      offerContainer.innerHTML = "";
      window.latestPropositions = response.propositions || [];
      var allOffers = [];
      (response.propositions || []).forEach(function (p) {
        allOffers = allOffers.concat(p.items || []);
      });

      if (!allOffers.length) {
        offerContainer.innerHTML = "<p class=\"carousel-message\">No AJO offers returned.</p>";
        updateCarouselButtons(offerContainer);
        return;
      }

      var tokensByIndex = [];
      (response.propositions || []).forEach(function (proposition) {
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
      });

      var impressionItems = [];
      allOffers.forEach(function (item, itemIndex) {
        var offerId = item.id;
        var trackingToken = tokensByIndex[itemIndex] || item.token;
        if (offerId && trackingToken) impressionItems.push({ id: offerId, token: trackingToken });

        var decoded = decodeHtml(item.data && item.data.content ? item.data.content : "");
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = decoded;
        [].slice.call(tempDiv.children).forEach(function (child) {
          if (child.classList.contains("offer-item")) {
            offerContainer.appendChild(child);
            child.querySelectorAll("a, button").forEach(function (el) {
              el.addEventListener("click", function () {
                var ecidValue = getECID();
                if (!ecidValue || !offerId || !trackingToken) return;
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
                        propositions: window.latestPropositions
                      }
                    }
                  }
                });
              });
            });
          }
        });
      });

      offerContainer.scrollLeft = 0;
      updateCarouselButtons(offerContainer);

      if (impressionItems.length > 0) {
        var ecidValue = getECID();
        if (!ecidValue) return;
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
                  propositions: window.latestPropositions
                }
              }
            }
          });
        });
      }
    }).catch(function (err) {
      console.error("Personalization failed:", err);
      offerContainer.innerHTML = "<p class=\"carousel-message\">No offers returned.</p>";
      updateCarouselButtons(offerContainer);
    });
  }

  function switchUser(userId) {
    var user = ZAPZAP_USERS.filter(function (u) { return u.id === parseInt(userId, 10); })[0];
    if (!user) return;
    currentUser = user;
    updateHero(currentUser);
    renderUsageCard(currentUser);
    if (typeof alloy === "function") {
      requestOffers(currentUser);
    } else {
      offerContainer.innerHTML = "<p class=\"carousel-message\">Loading…</p>";
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
    renderUsageCard(currentUser);
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

  waitForAlloy(function () {
    if (currentUser) requestOffers(currentUser);
  });
})();
