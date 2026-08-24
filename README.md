# Customisable Birthday Wishing

A responsive, single-page birthday journey with five visual themes, interactive surprises, a private receiver wish, background music controls, and offline-ready PWA support.

## Personalise it

Open `config.js` and edit the single `CONFIG` object. Set `birthday.month` and `birthday.day` for the countdown, then replace the recipient, sender, letter, memories, surprise messages, appreciation lines, final wish, and footer. The current media is `KALYANI.mp3`, `pic1.jpeg`, `pic2.jpeg`, `pic3.jpeg`, and `cat.gif`.

## Sender and recipient flow

Use the `Sender view` button in the top-right corner to save or change the birthday month and day. The receiver starts on the countdown page and can enter the journey after viewing the date. At the end, they can type a birthday wish and their name. When submitted, it is saved in that browser's local storage with the receiver's reply date and time. Open `Sender view` again on the same device to see the wish and the `Replied on` timestamp.

For a sender and recipient on different devices, deploy the site with a backend or form endpoint and replace the local-storage reply handler in `app.js`; static GitHub Pages hosting cannot sync private replies between browsers by itself.

## Run locally

Because the service worker needs HTTP, use any static server from the project folder, for example:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. The site can be deployed directly to GitHub Pages, Netlify, or Vercel.
