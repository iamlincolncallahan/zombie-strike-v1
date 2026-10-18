# Dead Hours — Zombie Strike

A desktop first-person zombie survival game built with HTML, CSS, JavaScript and Three.js. Explore an original two-story, eight-room manor; zombies navigate rooms and stairs to hunt you. Includes hitscan shooting, headshots, reloading, flashlight, sprinting, collectible supplies, escalating waves, sound, pause and restart.

## Run

From PowerShell in this folder:

```powershell
powershell -ExecutionPolicy Bypass -File .\serve.ps1
```

Open **http://localhost:8080** in a modern desktop browser with WebGL. Alternatively serve this directory with any static web server. ES modules need HTTP; opening index.html directly will not work. Click **Enter the house** to capture the mouse.

WASD move · mouse look · left click shoot · Ctrl sprint · Shift crouch · R reload · F flashlight · E collect nearby supplies · Esc pause. Clear all zombies to advance a wave. Supply kits refresh between waves. The central staircase connects both floors.

Zombies take **2 headshots or 4 body shots** to kill; one headshot counts as two body shots. Wave 1 has **8 zombies**, with **4 more each wave** (8, 12, 16, 20...). Movement speed starts at **1.3 meters/second** and increases by **0.15 meters/second every wave**, with no speed cap.

Every fifth wave has a boss, which appears after that wave's regular zombies are all defeated. Bosses take **5 headshots or 10 body shots**. Each later boss moves faster and deals more bite damage than the previous one.

The HUD shows your **bites / 5** and current infection effects. At **2 bites**, walking and sprinting drop to 55% speed. At **3 bites**, time between shots increases from 0.23 to 0.6 seconds. At **4 bites**, the world becomes heavily blurred while the HUD remains readable. **5 bites kills you.** Effects stack. Each collected health kit removes one bite and reverses effects below their threshold, alongside its ammunition refill. Health reflects remaining bite tolerance (20 points per bite); clearing a wave does not cure bites. Restart clears all infection effects.

## Assets and licenses

- [Three.js 0.170.0](https://github.com/mrdoob/three.js/tree/r170): MIT, vendored locally.
- [Kenney Crosshair Pack](https://kenney.nl/assets/crosshair-pack): CC0; aiming reticle, original archive and license included in assets.
- [Poly Haven Wood Floor](https://polyhaven.com/a/wood_floor), Dimitrios Savva: CC0; 1K diffuse map used on floors.
- [Freesound audio credits](assets/audio/CREDITS.md): CC0 recordings for wooden footsteps, pistol shots, reloading, and zombie growls. Stored locally; no Freesound login or connection needed to play. Small interface cues are synthesized.
- House, furniture, zombies and weapon: original procedural geometry.
- Barlow Condensed and IBM Plex Mono are requested from Google Fonts; system font fallbacks work offline.

All gameplay dependencies and textures are local. No build step, account, or API key required. Keyboard and mouse required; touch controls are not implemented.

Footsteps follow actual travel distance and speed up when sprinting. Reload audio matches the 1.5-second animation. Zombie growls follow their position with stereo direction, distance attenuation, and muffling between floors. Sound starts after clicking Enter the House. SOUND OFF, pause, death, and restart stop active clips.

## Verification

Open http://localhost:8080/?test=1 to run the browser smoke checks. These check navigation connectivity, zombie routes from all eight rooms, stair traversal, exterior collision, wave spawning, ammunition transfer, supply collection, restart, bite thresholds, actual movement and firing penalties, world blur, healing reversal, and five-bite death. All 25 checks passed in headless Chrome. The title screen was also rendered and visually inspected. Pointer-lock aiming and combat balance still benefit from a hands-on playtest.

Open `/audio-test.html` and click **Run checks** to check local audio decoding, reload timing, overlapping shots, zombie stereo/distance mixing, voice limits, mute, pause, and cleanup. All 16 audio checks passed in headless Chrome; this verifies playback behavior programmatically, not a listening review.
