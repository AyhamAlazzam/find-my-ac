# FindMyAC 🚀

A lightweight Chrome Extension (Manifest V3) that injects a direct action button into Codeforces problem pages, allowing competitive programmers to instantly view their accepted solutions across public contests, gyms, and private groups.

---

## 💡 Why FindMyAC?
Navigating through hundreds of submissions to find your accepted solution on Codeforces—especially inside private groups or gym contests—often results in annoying navigation overhead or `403 Forbidden` errors. **FindMyAC** automates this by inspecting your session status and providing a one-click button directly below the problem title.

---

## ✨ Features
* **Automatic Handle Detection:** Scrapes the currently active session handle from the page DOM dynamically.
* **Gym & Group Resolution:** Automatically checks both group contests and gym environments to prevent permission issues.
* **Client-Side SHA-512 Signing:** Generates API signatures on-the-fly using the native Web Cryptography API (`crypto.subtle`).
* **Privacy-First:** Your Codeforces API Key and Secret are stored securely in `chrome.storage.local` and never leave your machine.
* **Native-Looking UI:** Smooth button integration styled to blend perfectly with Codeforces' interface.

---
## 📦 How to Install (Developer Mode)

1. Clone or download this repository:
   ```bash
   git clone [https://github.com/AyhamAlazzam/find-my-ac.git](https://github.com/AyhamAlazzam/find-my-ac.git)

2.Open Google Chrome and go to:chrome://extensions/

3.Enable Developer mode using the toggle switch in the top-right corner.

4.Click the Load unpacked button and select the project folder.

5.The FindMyAC icon will now appear in your browser extensions bar!

---
## 🔑 Setup & Usage

1. Go to your Codeforces API settings page: codeforces.com/settings/api and generate an API key pair.

2. Click the FindMyAC extension icon in your toolbar.

3. Enter your API Key and API Secret, then click Save Settings.

4. Open any problem page on Codeforces:

   * If you have solved it, a green "Show My Solution" button will appear immediately under the title.
    Clicking it opens your accepted submission in a new tab.

---
## 🛠️ Tech Stack

*Manifest Version: V3

*Language: Modern JavaScript (ES6+ / Async-Await)

*Security: Web Cryptography API (crypto.subtle SHA-512)

*APIs: Codeforces Official REST API (user.status)

---
## 📄 License

This project is open-source and available under the MIT License.
