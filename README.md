# chikpixels

A habit tracker where showing up reveals a pixel-art picture, one piece at a time.

- **One habit = one picture.** Pick a length (7, 14, 21, 30, 66, 100 days or your own). The picture is split into that many compact pieces.
- **Three ways to track.** Effort (0-100), check-in (done or not), or count (reach a target such as 8 glasses; the piece gets more vivid as you get closer).
- **Daily, weekly or every few days.** A square can be a day, one session of a weekly goal (for example 3 times a week), or a check-in every N days.
- **Free order or the calendar.** Log squares in any order, or follow real dates: today is highlighted, past squares can be filled in, future ones are locked.
- **Any order, backfill allowed.** Tap any day slot and log your effort (slider, quick buttons or a number, 0-100). Missed a day? Fill it in later.
- **Effort sets how vivid it is.** A piece only appears at or above the threshold (default 20); more effort means brighter colour.
- **Choose or be surprised.** Pick a picture and peek at its outline, or let the app choose a secret one that is only named when you finish.
- **Extend a habit.** Keep going after (or before) finishing: extending adds a new picture after the current one, with the same pace. Nothing you've revealed changes.
- **Holographic finished pictures.** Completed pictures and habit cards get an animated rainbow foil with a diamond lattice, like a trading card (it follows your pointer; reduced-motion users get it still).
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
