# Customisable Birthday Wishing

A responsive, single-page birthday journey with five visual themes, interactive surprises, a private wish reply, background music controls, and offline-ready PWA support.

## Personalise it

Open `config.js` and edit the single `CONFIG` object. Set `birthday.month` and `birthday.day` for the countdown, then replace the recipient, sender, letter, memories, surprise messages, appreciation lines, final wish, and footer. The current media is `KALYANI.mp3`, `pic1.jpeg`, `pic2.jpeg`, `pic3.jpeg`, and `cat.gif`.

## Sender and recipient flow

Use the `Sender view` button in the top-right corner to enter or change the receiver name and birthday month and day. After saving, use `Copy receiver link` and send that link to the receiver. Opening it applies the shared name and date before the configured defaults and saves them in the receiver's browser. The receiver starts on the countdown page, where the saved name and date appear with confetti, and can enter the journey after viewing them. At the end, they can type a birthday wish and their name. Every submission is appended to that browser's local storage with the receiver's reply date and time, so the receiver can send as many replies as they like. Open `Sender view` again on the same device to see the complete reply history. Older single-reply data is migrated automatically the first time the app loads.

For shared replies across different devices, this project supports Supabase. Create a Supabase project, open the SQL editor, run `supabase-schema.sql`, then copy the project URL and its public anon key into `CONFIG.backend` in `config.js`. The receiver does not need a GitHub account or a Supabase account. Replies are stored with the hidden profile key, so the sender and receiver see the same wish history. If the backend settings are blank or unavailable, the app falls back to local storage and still accepts unlimited repeated replies on that device.

The public anon key is intended for browser use. The database policies in `supabase-schema.sql` allow anonymous inserts and reads, so anyone who knows a profile key can read that profile's replies. Do not put a Supabase service-role key in `config.js`.

## Run locally

Because the service worker needs HTTP, use any static server from the project folder, for example:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`. The site can be deployed directly to GitHub Pages, Netlify, or Vercel.
