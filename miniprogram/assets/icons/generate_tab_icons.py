#!/usr/bin/env python3
"""Generate custom tab bar icons for KB Coach miniprogram."""
import cairosvg
import os

ICONS_DIR = os.path.dirname(os.path.abspath(__file__))
SIZE = 81  # WeChat tab bar recommended size
STROKE_W = 1.8
COLOR_NORMAL = "#b0b0b0"
COLOR_ACTIVE = "#22c55e"

# SVG templates for each icon (24x24 viewBox, Lucide-style linear)
ICONS = {
    "home": """<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
  <polyline points="9 21 9 14 15 14 15 21"/>
</svg>""",

    "analyze": """<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="5" r="3"/>
  <path d="M12 8v3"/>
  <path d="M8 20c0-3 1.5-5 4-5s4 2 4 5"/>
  <line x1="2" y1="12" x2="7" y2="12"/>
  <line x1="17" y1="12" x2="22" y2="12"/>
</svg>""",

    "plan": """<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
  <line x1="16" y1="2" x2="16" y2="6"/>
  <line x1="8" y1="2" x2="8" y2="6"/>
  <line x1="3" y1="10" x2="21" y2="10"/>
  <path d="M8 14h.01"/>
  <path d="M12 14h.01"/>
  <path d="M16 14h.01"/>
  <path d="M8 18h.01"/>
  <path d="M12 18h.01"/>
</svg>""",

    "chat": """<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
</svg>""",

    "exercises": """<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 12h12"/>
  <path d="M6 8v8a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2z"/>
  <path d="M18 8v8a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z"/>
</svg>""",
}


def generate_icon(name, svg_template, color, output_path):
    svg = svg_template.format(size=SIZE, color=color, sw=STROKE_W)
    cairosvg.svg2png(bytestring=svg.encode("utf-8"), write_to=output_path, output_width=SIZE, output_height=SIZE)
    print(f"  Generated: {output_path}")


def main():
    for name, template in ICONS.items():
        print(f"Generating {name} icons...")
        # Normal (gray)
        generate_icon(name, template, COLOR_NORMAL, os.path.join(ICONS_DIR, f"{name}.png"))
        # Active (green)
        generate_icon(name, template, COLOR_ACTIVE, os.path.join(ICONS_DIR, f"{name}-active.png"))
    print("\nDone! All 10 tab bar icons generated.")


if __name__ == "__main__":
    main()
