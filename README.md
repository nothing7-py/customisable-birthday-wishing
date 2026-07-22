# Customisable Birthday Wishing

A responsive, single-page birthday journey with five visual themes, eleven chapters, interactive surprises, background music controls, and offline-ready PWA support.

## Personalise it

Open `config.js` and edit the single `CONFIG` object. Set `birthday.month` and `birthday.day` for the countdown, then replace the recipient, sender, letter, memories, surprise messages, appreciation lines, final wish, and footer. Add local or hosted paths to `music.src` and the three `photos[].src` values.

## Sender and recipient flow

Use the `Sender view` button in the top-right corner to save or change the birthday month and day. The receiver starts on the countdown page and can enter the journey after viewing the date. When they submit the final gift response, it is saved in that browser's local storage. Open `Sender view` again on the same device to see the latest reply and timestamp.

For a sender and recipient on different devices, deploy the site with a backend or form endpoint and replace the local-storage reply handler in `app.js`; static GitHub Pages hosting cannot sync private replies between browsers by itself.

## Run locally

Because the service worker needs HTTP, use any static server from the project folder, for example:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. The site can be deployed directly to GitHub Pages, Netlify, or Vercel.
