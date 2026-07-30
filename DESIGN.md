# Design System

<!-- impeccable:design-schema 1 -->

## Visual Identity

- **Theme**: Dual-Theme Cyber Forensic Workstation (Clinical Light / Midnight Dark).
- **Light Mode Palette**: Pure slate canvas (`bg-slate-50`), white glass panels (`rgba(255,255,255,0.85)` with blur), slate text (`text-slate-900`), and emerald/cyan gradient accents (`#059669`, `#0891b2`).
- **Dark Mode Palette**: Deep midnight canvas (`bg-[#070b14]`), dark glass cards (`rgba(15,23,42,0.7)` with blur), light slate text (`text-slate-100`), and glowing emerald/cyan accents (`#10b981`, `#06b6d4`).
- **Typography**: Inter / system sans-serif for UI layout, combined with crisp monospace typography for cryptographic hashes, timestamps, EXIF metadata, and ELA sensitivity percentages.

## Components & Micro-Interactions

- **Theme Reactivity**: Full `next-themes` integration with hydration protection (`mounted` state) and instant switching between dark and light modes via the header toggle button.
- **Interactive Hero Terminal**: Live forensic audit workstation preview widget featuring real-time tab switching (ELA Analysis, EXIF Metadata, SHA-256 Signature), interactive sensitivity slider, and top-to-bottom laser scanbeam keyframe animation (`animate-scanbeam`).
- **Public Cryptographic Verifier**: Real-time hash search module with sample quick-test buttons, live verification state, state badge indicators (VÁLIDO, ALERTA, NO ENCONTRADO), and 1-click clipboard hash copy.
- **Responsive Layout**: Full mobile responsiveness down to 320px screens, with drawer menu navigation, responsive grid columns (`grid-cols-1 md:grid-cols-3`), and touch-friendly targets.
- **Legal Compliance Section**: Visual trust cards detailing ISO/IEC 27037 digital evidence standards, and perito certification guarantees.

## Motion Strategy

- **Scan Beam**: `@keyframes scanbeam` animating a laser line across forensic sample images.
- **Pulse Glow**: `@keyframes pulseGlow` providing subtle background radial glow pulsation.
- **Float Slow**: `@keyframes floatSlow` giving floating status pill badges gentle levitation.
