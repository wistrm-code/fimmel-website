// Shows the license key for a Stripe purchase. The Payment Links redirect
// here with ?session_id={CHECKOUT_SESSION_ID}; the web-purchase edge
// function checks the session with Stripe and returns the key.
(function () {
  const endpoint = 'https://jfgokufdfzztgdoypeuv.supabase.co/functions/v1/web-purchase';
  const status = document.getElementById('tackStatus');
  const box = document.getElementById('tackKey');
  const keyText = document.getElementById('tackKeyText');
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const contact = ' Hör av dig till support@fimmel.se så hjälper vi dig.';

  if (!sessionId) {
    status.textContent = 'Vi hittade inget köp att visa.' + contact;
    return;
  }

  let attempts = 0;
  async function load() {
    attempts++;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data.licenseKey) {
        keyText.textContent = data.licenseKey;
        box.hidden = false;
        status.textContent = 'Betalningen är klar.';
        return;
      }
      if (data.error === 'LICENSE_REVOKED') {
        status.textContent = 'Det här köpet har återbetalats.';
        return;
      }
    } catch (e) {
      // Network hiccup — retry below.
    }
    // Some payment methods confirm a little later; keep trying for ~2 minutes.
    if (attempts < 40) {
      setTimeout(load, 3000);
    } else {
      status.textContent = 'Betalningen är inte bekräftad än. Ladda om sidan om en stund.' + contact;
    }
  }

  document.getElementById('tackCopy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(keyText.textContent);
      document.getElementById('tackCopy').textContent = 'Kopierad!';
    } catch (e) {
      // Clipboard blocked — the key is still selectable.
    }
  });

  load();
})();
