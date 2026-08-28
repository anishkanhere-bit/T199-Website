# Troop 199

Modern multi-page website for Boy Scout Troop 199 in Fremont, California.

## Site pages

- `index.html` — Home, troop history, mission, program, schedule, gallery, joining, and contact
- `outings.html` — Camping, hiking, summer camp, high adventure, and outing preparation
- `skills.html` — Fun field skills and core outdoor skill topics
- `forms.html` — Medical and travel forms, every original packing list, cookbook, menu planner, Grubmaster list, and leadership documents
- `scout-info.html` — Advancement, badge symbolism, outdoor ethics, religious emblems, and leadership

## Preview

Open `index.html` in your browser.

## Meeting info

- **When:** Every Wednesday except holidays, 7:00–8:30 PM
- **Where:** Warm Springs Elementary Multi Purpose Room (MUR), Fremont, CA

## Add events later

Edit the `schedule` array in `js/main.js`:

```js
const schedule = [
  { date: "Sept 6, 2026", event: "Troop Meeting", location: "Warm Springs Elementary MUR", notes: "" },
];
```

Until that list is filled in, the schedule table stays blank.

## Original-site material

Evergreen content and document links from `t199.org` have been retained and reorganized.
Old event dates and announcements were intentionally excluded.

## Photos

Troop photos carried over from `t199.org` live in `images/og/`. The homepage
slideshow uses ten of them; the rest are kept there as spares.

- `images/hero-bg.jpg` — homepage hero background
- `images/troop-199-logo.png` — header emblem

### Changing the slideshow

Edit the `galleryPhotos` array in `js/main.js`. Order controls playback order,
and each caption doubles as the image's alt text and screen-reader label:

```js
const galleryPhotos = [
  { file: "og/og-07.jpg", caption: "The whole troop on the ridge above the bay" },
];
```

The slideshow advances every 6 seconds and pauses on hover, on keyboard focus,
when scrolled out of view, and for visitors who prefer reduced motion. Arrows,
dots, arrow keys, and swipe all work, and clicking a photo opens it full size.
