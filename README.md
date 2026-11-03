# chikpixels

A habit tracker where showing up reveals a pixel-art picture, one piece at a time.

- **One habit = one picture.** Pick a length (7, 14, 21, 30, 66, 100 days or your own). The picture is split into that many compact pieces.
- **Any order, backfill allowed.** Tap any day slot and log your effort (slider, quick buttons or a number, 0-100). Missed a day? Fill it in later.
- **Effort sets how vivid it is.** A piece only appears at or above the threshold (default 20); more effort means brighter colour.
- **Choose or be surprised.** Pick a picture and peek at its outline, or let the app choose a secret one that is only named when you finish.
- Data lives in your browser (`localStorage`). No accounts yet.

## Develop

```bash
npm install
npm run dev     # local dev server
npm test        # unit tests
npm run build   # type-check + production build (PWA)
```

## Art

Pictures are small JSON files (see `src/lib/art.ts`): a palette plus rows of characters, `.` for transparent.
Put publishable art in `src/art/public/`. Anything in `src/art/private/` is loaded locally but git-ignored,
so prototype art you do not own the rights to never reaches the public repo.
