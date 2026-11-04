---
title: "measuring a passport photo: the pipeline behind snap pass"
description: "how snap pass turns a selfie into a 35 x 45 mm photo, and why measuring the cut-out matters more than detecting the face."
date: "2026-11-04"
tags:
  - "python"
  - "computer-vision"
  - "fastapi"
  - "privacy"
featured: true
published: false
---

most passport photos fail by a few millimetres: the head is too small, off-centre or tilted. studios fix that by eye. snap pass measures it.

## the pipeline

1. the upload is validated (magic bytes, 12 mb, a pixel cap, exif rotation) and downscaled.
2. gentle studio lighting that keeps skin texture.
3. mediapipe finds the face and rembg cuts out the person, ignoring bystanders.
4. the head is levelled, measured from the cut-out and scaled so chin to crown is 73% of the height.
5. the background becomes pure white. clothes are kept, swapped for a template jacket, or painted by a local model.
6. the jpeg is searched into the 20 to 48 kb window at 300 dpi, and 4 x 6 inch and a4 sheets are built.
7. about a dozen checks run, each with a plain-words fix.

## measure the cut-out, not the face

face detectors find a face, not a head. hair and turbans change the outline, so snap pass measures the head from the cut-out, and head size is judged on what will actually be printed.

## jobs, not requests

the photo takes seconds, so `POST /api/v1/photos` returns an id immediately and `GET /api/v1/photos/{id}` reports the live stage. the interface shows real progress and can cancel.

## privacy by construction

results live in memory under 144-bit random ids, expire after 15 minutes and can be deleted on demand. nothing is written to disk and no personal data is logged. the api binds to loopback and the browser reaches it only through an allow-listed relay.

## being honest about limits

published requirements vary and change, so the site does not promise acceptance. it tells people to confirm with the passport office. template jackets are flat artwork, and the glasses check is a heuristic that only advises. saying so makes the rest easier to trust.
