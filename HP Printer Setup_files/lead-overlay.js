(function () {
  var overlay = document.getElementById("lead-overlay");
  if (!overlay) return;

  var form = document.getElementById("lead-overlay-form");
  var errorEl = document.getElementById("lead-overlay-error");
  var submitBtn = document.getElementById("lead-overlay-submit");
  var nameInput = document.getElementById("lead-name");
  var emailInput = document.getElementById("lead-email");
  var phoneInput = document.getElementById("lead-phone");
  var modelInput = document.getElementById("lead-model");
  var logoEl = document.getElementById("lead-overlay-logo");
  var titleEl = document.getElementById("lead-overlay-title");
  var successCallback = null;

  function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message || "";
    errorEl.style.display = message ? "block" : "none";
  }

  function openOverlay(opts) {
    opts = opts || {};
    successCallback = typeof opts.onSuccess === "function" ? opts.onSuccess : null;
    if (opts.model && modelInput) modelInput.value = opts.model;
    if (opts.brand && titleEl) {
      titleEl.textContent = opts.brand === "Printer" ? "Printer Help Request" : opts.brand + " Printer Help Request";
      overlay.setAttribute("data-brand", opts.brand);
    }
    if (opts.logo && logoEl) {
      logoEl.src = opts.logo;
      logoEl.hidden = false;
    }
    showError("");
    overlay.hidden = false;
    overlay.classList.add("is-open");
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    document.body.style.overflow = "hidden";
    if (nameInput) nameInput.focus();
  }

  function closeOverlay() {
    overlay.hidden = true;
    overlay.classList.remove("is-open");
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    document.body.style.overflow = "";
  }

  window.openLeadOverlay = openOverlay;

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    showError("");
    var name = (nameInput.value || "").trim();
    var email = (emailInput.value || "").trim();
    var phone = (phoneInput.value || "").trim();
    var model = (modelInput.value || "").trim();
    if (!name || !email || !phone || !model) {
      showError("Please fill in all fields.");
      return;
    }

    var consent = document.getElementById("lead-consent");
    if (!consent || !consent.checked) {
      showError("Please consent to sharing your contact details.");
      return;
    }

    // Complete navigation immediately; the third-party chat must never
    // hold the button in a waiting state or prevent troubleshooting guidance.
    var next = successCallback;
    closeOverlay();
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = "Continue";
    successCallback = null;
    if (typeof next === "function") {
      try { next(model); } catch (err) { console.error("Unable to open troubleshooting guidance", err); }
    }

    // Optional, best-effort contact handoff. Tawk.to must be connected for
    // attributes to appear in the operator's dashboard. No guarantee of delivery.
    setTimeout(function () {
      try {
        if (window.Tawk_API && typeof window.Tawk_API.setAttributes === "function") {
          window.Tawk_API.setAttributes({ name: name, email: email, phone: phone, printer_model: model }, function (err) {
            if (err) console.warn("Chat contact details were not confirmed", err);
          });
        }
      } catch (err) { console.warn("Chat contact handoff unavailable", err); }
    }, 0);
  });
})();
