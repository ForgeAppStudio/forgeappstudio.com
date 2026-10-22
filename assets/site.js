// Copy-to-clipboard buttons for email addresses, and the Leanto waitlist form.
(function () {
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var label = btn.textContent;
      function done(msg) {
        btn.textContent = msg;
        setTimeout(function () { btn.textContent = label; }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done("Copied"); }, function () { select(); });
      } else { select(); }
      function select() {
        var target = document.getElementById(btn.getAttribute("aria-controls"));
        if (target) {
          var range = document.createRange();
          range.selectNodeContents(target);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          done("Selected");
        }
      }
    });
  });

  // Waitlist form. Sign-ups go to the "Leanto waitlist" Google Sheet through a Google Apps Script web app.
  // Left empty, the form runs in preview mode and sends nothing.
  var FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbyOdpljZwZ7y_woU5LXW2CiEN7sjgnaN9Blbtzc6YbOfJQocnncAAv0P1kmJ6mDMZor/exec";
  var form = document.getElementById("waitlist-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  function show(msg) { status.textContent = msg; status.hidden = false; }
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var email = form.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show("Please enter an email address, like name@example.com.");
      form.email.focus();
      return;
    }
    if (!form.querySelector('input[name="role"]:checked')) {
      show("Please choose how you're signing up.");
      return;
    }
    if (!FORM_ENDPOINT) {
      show("Thanks! This is a preview of the site, so nothing was sent. Once the site is live, this form will add you to the waitlist.");
      return;
    }
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    show("Sending...");
    // Sent as plain form data so the browser doesn't need an extra permission check with Google first.
    fetch(FORM_ENDPOINT, { method: "POST", body: new URLSearchParams(new FormData(form)) })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.ok) { form.reset(); show("You're on the list. Thank you! We'll email you when there's something to try."); }
        else if (data && data.error === "invalid_email") { show("Please check your email address and try again."); }
        else { show("That didn't go through. Please try again in a minute, or email don@forgeappstudio.com."); }
      })
      .catch(function () { show("That didn't go through. Check your connection and try again, or email don@forgeappstudio.com."); })
      .then(function () { button.disabled = false; });
  });
})();
