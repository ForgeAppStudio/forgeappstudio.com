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

  // Waitlist form. Set FORM_ENDPOINT to your form service's address (for example a Formspree form URL).
  // Left empty, the form runs in preview mode and sends nothing.
  var FORM_ENDPOINT = "";
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
    show("Sending...");
    fetch(FORM_ENDPOINT, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } })
      .then(function (res) {
        if (res.ok) { form.reset(); show("You're on the list. Thank you! We'll email you when there's something to try."); }
        else { show("That didn't go through. Please try again in a minute, or email don@forgeappstudio.com."); }
      })
      .catch(function () { show("That didn't go through. Check your connection and try again."); });
  });
})();
