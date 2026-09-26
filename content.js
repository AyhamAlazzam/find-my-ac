/**
 * Codeforces Problem Solution Inspector
 * Injects a status button into Codeforces problem pages linking to the user's accepted submission.
 */

// ==========================================
// 1. Constants & Styles
// ==========================================
const BUTTON_STYLES = {
  base: `
    display: inline-block;
    margin-top: 10px;
    padding: 6px 14px;
    color: white;
    font-weight: bold;
    text-decoration: none;
    border-radius: 4px;
    font-size: 13px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    transition: background-color 0.2s;
  `,
  loading: '#718096',
  preparing: '#2b6cb0',
  solved: '#2e7d32',
  unsolved: '#a0aec0',
  error: '#e53e3e'
};

// ==========================================
// 2. Cryptographic Utilities
// ==========================================
async function sha512(str) {
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// ==========================================
// 3. DOM & Page Helpers
// ==========================================
function getProblemTitleElement() {
  return document.querySelector('.problem-statement .header .title');
}

function getLoggedInHandle() {
  return document.querySelector('.lang-chooser a[href*="/profile/"]')?.innerText.trim() || null;
}

function normalizeProblemName(rawTitle) {
  return rawTitle.replace(/^[A-Z0-9]+\.\s*/, '').trim().toLowerCase();
}

function createStatusButton() {
  const btn = document.createElement('a');
  btn.style.cssText = BUTTON_STYLES.base;
  btn.style.backgroundColor = BUTTON_STYLES.loading;
  btn.innerText = "Checking submissions...";
  return btn;
}

function updateButtonState(btn, state, text, url = null) {
  btn.innerText = text;
  btn.style.backgroundColor = BUTTON_STYLES[state] || BUTTON_STYLES.loading;
  
  if (url) {
    btn.href = url;
    btn.target = "_blank";
    btn.style.cursor = "pointer";
  } else {
    btn.removeAttribute('href');
    btn.style.cursor = "default";
  }
}

// ==========================================
// 4. API & Network Calls
// ==========================================
async function fetchUserSubmissions(handle, key, secret) {
  const time = Math.floor(Date.now() / 1000);
  const rand = Math.random().toString(36).substring(2, 8);
  const params = `apiKey=${key}&count=10000&from=1&handle=${handle}&time=${time}`;
  const hash = await sha512(`${rand}/user.status?${params}#${secret}`);

  const res = await fetch(`https://codeforces.com/api/user.status?${params}&apiSig=${rand}${hash}`);
  const data = await res.json();

  if (data.status !== "OK") {
    throw new Error(data.comment || "Failed to fetch submissions");
  }
  return data.result;
}

async function getUserGroups(handle) {
  try {
    const res = await fetch(`https://codeforces.com/groups/with/${handle}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const groupLinks = Array.from(doc.querySelectorAll('a[href*="/group/"]'));
    const groupIds = new Set();
    groupLinks.forEach(a => {
      const match = a.href.match(/\/group\/([a-zA-Z0-9]+)/);
      if (match) groupIds.add(match[1]);
    });
    return Array.from(groupIds);
  } catch (e) {
    return [];
  }
}

// ==========================================
// 5. Link Resolution 
// ==========================================
async function resolveSubmissionUrl(contestId, subId, handle) {
  const currentGroupMatch = window.location.pathname.match(/\/group\/([^\/]+)/);

  if (currentGroupMatch && window.location.pathname.includes(`/contest/${contestId}`)) {
    return `https://codeforces.com/group/${currentGroupMatch[1]}/contest/${contestId}/submission/${subId}`;
  }

  if (contestId < 100000) {
    return `https://codeforces.com/contest/${contestId}/submission/${subId}`;
  }

  const groups = await getUserGroups(handle);
  for (const gId of groups) {
    try {
      const checkRes = await fetch(`https://codeforces.com/group/${gId}/contest/${contestId}`);
      if (checkRes.ok && !checkRes.url.includes("predownload") && !checkRes.redirected) {
        return `https://codeforces.com/group/${gId}/contest/${contestId}/submission/${subId}`;
      }
    } catch (e) {}
  }

  return `https://codeforces.com/gym/${contestId}/submission/${subId}`;
}

// ==========================================
// 6. Main Orchestrator
// ==========================================
async function main() {
  const titleElement = getProblemTitleElement();
  if (!titleElement) return;

  const activeHandle = getLoggedInHandle();
  if (!activeHandle) return;

  const { cf_key, cf_secret } = await chrome.storage.local.get(['cf_key', 'cf_secret']);
  if (!cf_key || !cf_secret) return;

  const btn = createStatusButton();
  titleElement.parentElement.appendChild(btn);

  try {
    const cleanProblemName = normalizeProblemName(titleElement.innerText);
    const submissions = await fetchUserSubmissions(activeHandle, cf_key, cf_secret);

    const acceptedSub = submissions.find(sub => 
      sub.verdict === "OK" && 
      sub.problem.name.toLowerCase() === cleanProblemName
    );

    if (!acceptedSub) {
      updateButtonState(btn, 'unsolved', "Haven't been solved yet");
      return;
    }

    updateButtonState(btn, 'preparing', "Preparing link...");

    const targetUrl = await resolveSubmissionUrl(
      acceptedSub.contestId,
      acceptedSub.id,
      activeHandle
    );

    updateButtonState(btn, 'solved', "Show My Solution", targetUrl);

  } catch (err) {
    console.error("Codeforces Solution Inspector Error:", err);
    updateButtonState(btn, 'error', "Error loading submissions");
  }
}

main();