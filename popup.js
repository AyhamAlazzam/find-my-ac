/**
 * Codeforces Problem Solution Inspector - Settings Popup
 * Handles credential persistence, auto-draft saving, and storage clearing.
 */

// ==========================================
// 1. DOM Elements
// ==========================================
const apiKeyInput = document.getElementById('apiKey');
const apiSecretInput = document.getElementById('apiSecret');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');

// ==========================================
// 2. UI Feedback Helpers
// ==========================================
function flashButtonState(button, { text, className = '', styles = {} }, duration = 2000) {
  const originalText = button.innerText;
  const originalClassName = button.className;
  const originalStyles = {};

  Object.keys(styles).forEach((key) => {
    originalStyles[key] = button.style[key];
    button.style[key] = styles[key];
  });

  button.innerText = text;
  button.className = className;

  setTimeout(() => {
    button.innerText = originalText;
    button.className = originalClassName;
    Object.keys(originalStyles).forEach((key) => {
      button.style[key] = originalStyles[key];
    });
  }, duration);
}

// ==========================================
// 3. Storage & State Management
// ==========================================
async function loadStoredCredentials() {
  const data = await chrome.storage.local.get(['cf_key', 'cf_secret', 'draft_key', 'draft_secret']);
  apiKeyInput.value = data.draft_key ?? data.cf_key ?? '';
  apiSecretInput.value = data.draft_secret ?? data.cf_secret ?? '';
}

function persistDraft() {
  chrome.storage.local.set({
    draft_key: apiKeyInput.value,
    draft_secret: apiSecretInput.value
  });
}

async function handleSaveCredentials() {
  const key = apiKeyInput.value.trim();
  const secret = apiSecretInput.value.trim();

  if (!key || !secret) {
    flashButtonState(saveBtn, {
      text: 'Please fill all fields!',
      className: 'btn-red'
    });
    return;
  }

  await chrome.storage.local.set({
    cf_key: key,
    cf_secret: secret,
    draft_key: key,
    draft_secret: secret
  });

  flashButtonState(saveBtn, {
    text: 'Saved ✓',
    className: 'btn-green'
  });
}

async function handleClearData() {
  await chrome.storage.local.remove(['cf_key', 'cf_secret', 'draft_key', 'draft_secret']);
  
  apiKeyInput.value = '';
  apiSecretInput.value = '';

  flashButtonState(clearBtn, {
    text: 'Data Cleared ✓',
    styles: {
      color: '#38a169',
      borderColor: '#c6f6d5'
    }
  });
}

// ==========================================
// 4. Event Listeners & Initialization
// ==========================================
apiKeyInput.addEventListener('input', persistDraft);
apiSecretInput.addEventListener('input', persistDraft);

saveBtn.addEventListener('click', handleSaveCredentials);
clearBtn.addEventListener('click', handleClearData);

loadStoredCredentials();
document.getElementById('appVersion').innerText = `v${chrome.runtime.getManifest().version}`;