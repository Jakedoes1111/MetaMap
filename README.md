# MetaMap

**A unified platform for exploring multiple self-model systems through a single, normalized dataset.**

MetaMap is a modern TypeScript + React web application (built with Next.js) that allows you to explore and compare insights from various self-model systems—including Western Astrology (WA/HA), Jyotish (JA), BaZi, Zi Wei Dou Shu, Feng Shui, Human Design, Gene Keys, Numerology, Tarot, I Ching, and more—all within one cohesive interface.

## What is MetaMap?

MetaMap solves a common problem: self-model systems (astrology, numerology, human design, etc.) each have their own data formats, tools, and interfaces, making it difficult to see connections and patterns across systems. MetaMap provides:

- **Unified Data Schema**: A normalized, Zod-validated schema that works across all systems
- **Cross-System Visualization**: Timeline, compass, network, and heatmap views to see patterns across systems
- **Configurable Weighting**: Adjust the importance of different systems (e.g., Human Design 0.6, Gene Keys 0.5)
- **Verifiable Data**: No invented results—only verified calculator outputs or explicit UNKNOWN placeholders
- **Privacy-First**: Local data storage, privacy flags for paid sources, and no external data transmission

### Key Features

- ✅ **Normalized Schema** - Enforced via Zod with CSV/JSON import/export
- ✅ **Rich Visualizations** - Timeline, compass, network, and heatmap views powered by D3
- ✅ **Adjustable Weights** - Customize system importance (defaults: HD 0.6, GK 0.5, others 1.0)
- ✅ **RNG Tools** - Built-in random number generators for I Ching, Tarot, and Geomancy
- ✅ **Plugin Architecture** - TypeScript interfaces ready for calculator integrations
- ✅ **Accessibility** - WCAG AA compliant with reduced-motion support
- ✅ **Responsive Design** - Works seamlessly on desktop and mobile devices

---

## Getting Started

### Prerequisites

- Node.js 20+ (or use Docker)
- npm or yarn

### Installation

```bash
# Install dependencies
npm ci --ignore-scripts

# Optional: Install Playwright browsers for E2E tests
npx playwright install --with-deps

# Start development server
npm run dev
```

Open [http://localhost:3010](http://localhost:3010) in your browser.

### Docker

For a containerized environment:

```bash
docker compose up --build
```

This runs a Node 20 Alpine environment with the app available on port 3010.

---

## Available Scripts

| Command              | Description                                           |
|----------------------|-------------------------------------------------------|
| `npm run dev`        | Start the Next.js development server (port 3010)     |
| `npm run build`      | Create production build                                |
| `npm run start`      | Start production server                                |
| `npm run lint`       | Run ESLint (TypeScript + React + jsx-a11y)            |
| `npm run test`       | Run Vitest unit tests with jsdom                       |
| `npm run test:ci`    | Run Vitest with coverage report                       |
| `npm run test:e2e`   | Run Playwright E2E tests (requires dev server)       |
| `npm run format`     | Format code with Prettier                             |

---

## Data Schema

MetaMap uses a normalized schema defined in `src/schema.ts` (Zod + TypeScript types). The CSV column order is:

```
person_id,birth_datetime_local,birth_timezone,system,subsystem,
source_tool,source_url_or_ref,data_point,verbatim_text,category,
subcategory,direction_cardinal,direction_degrees,timing_window_start,
timing_window_end,polarity,strength,confidence,weight_system,notes
```

### Schema Rules

- **Datetime**: ISO 8601 format, closed intervals only (`start <= end`)
- **Direction**: Degrees 0–359 (auto-derives cardinal direction if missing)
- **Strength**: Integer range -2 to +2
- **Confidence**: Float between 0 and 1
- **Weight**: Positive number (defaults: HD 0.6, GK 0.5, others 1.0)
- **Timezone**: Must be a valid IANA timezone database identifier

### Supported Systems

- **WA/HA** - Western Astrology (Tropical/Tropical Houses)
- **JA** - Jyotish (Vedic Astrology)
- **BaZi** - Four Pillars of Destiny
- **ZWDS** - Zi Wei Dou Shu (Purple Star)
- **QMDJ** - Qi Men Dun Jia
- **FS** - Feng Shui
- **HD** - Human Design
- **GK** - Gene Keys
- **Numerology** - Pythagorean & Chaldean
- **Tarot** - Card readings
- **I Ching** - Hexagram readings
- **Geomancy** - Geomantic figures
- **Palmistry** - Palm reading
- **MianXiang** - Face reading

---

## Import & Export Data

### Importing Data

1. Prepare a CSV or JSON file matching the schema header
2. Navigate to the overview page (`/`)
3. Use the **Import data** panel to:
   - **Append** new rows to existing data
   - **Replace** the entire dataset
4. Zod validates every row and surfaces detailed error messages for invalid data

### Exporting Data

1. Apply any filters you want to include
2. Click **Export data** to download:
   - CSV format (maintains schema column order)
   - JSON format (preserves ISO timestamps)

### Sample Data

A sample CSV file is included at `public/sample.csv` with representative rows covering:
- Western Astrology (WA)
- Feng Shui (FS)
- BaZi (Four Pillars)
- Numerology
- Tarot readings
- Privacy flags (`privacy:paid` examples)

---

## Calculator Providers & Plugins

MetaMap uses a plugin architecture for calculator integrations. Provider interfaces are defined in `src/calculators/`:

- **EphemerisProvider** - Swiss Ephemeris/JPL-compatible natal positions
- **ChineseCalendarProvider** - BaZi pillars, luck cycles, sexagenary conversions
- **ZWDSProvider** - Zi Wei Dou Shu chart calculations
- **QMDJProvider** - Qi Men Dun Jia board generation
- **FSProvider** - Feng Shui Flying Stars & Eight Mansions
- **HDProvider** - Human Design BodyGraph
- **GKProvider** - Gene Keys sequences

### Demo Providers

The app includes demo providers for Ephemeris, Chinese Calendar, Zi Wei Dou Shu, and Qi Men Dun Jia when `NEXT_PUBLIC_ENABLE_DEMO_PROVIDERS=true` (enabled by default in non-production).

### Integrating Your Own Providers

1. Implement the provider interface from `src/calculators/[system].ts`
2. Register your provider in `src/providers/bootstrap.ts`
3. Update the relevant system route in `app/systems/**`

**Important**: When a provider is absent, UI components display `UNKNOWN` placeholders. MetaMap never invents results—only deterministic calculations (like numerology) are pre-filled.

### Privacy & Licensing

- Mark paid or proprietary sources with `notes:"privacy:paid"` so users can filter them
- Review third-party calculator licenses before integration
- Production builds should disable demo providers

---

## Truth Standard & Privacy

MetaMap follows strict principles:

- **No Invention**: `UNKNOWN` placeholders remain until verified calculators are connected
- **Variant Flags**: Displayed when settings deviate from defaults (e.g., non-Lahiri ayanāṃśa)
- **Local Storage**: Palmistry and MianXiang uploads stay in the browser
- **Privacy Flags**: Support for marking paid/proprietary data sources
- **Disclaimers**: "No medical, legal or financial advice. Cultural systems shown respectfully; outcomes are not certainties."

### References

- [IANA Timezone Database](https://www.iana.org/time-zones) - For timezone validation
- [Swiss Ephemeris](https://www.astro.com/swisseph/) - Ephemeris calculations (licensing applies)
- [Hong Kong Observatory Chinese Calendar](https://www.hko.gov.hk/en/gts/time/calendar_info.htm) - For BaZi derivations

---

## Testing

### Unit Tests

Vitest covers utilities, provider APIs, and core components:

```bash
npm run test
```

For CI environments:

```bash
npm ci --ignore-scripts
npx vitest run
```

### End-to-End Tests

Playwright E2E tests verify CSV import/export workflows:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run E2E tests
npm run test:e2e
```

Install Playwright browsers first: `npx playwright install --with-deps`

---

## Project Structure

```
src/
  app/                    # Next.js App Router routes
    timeline/             # Timeline Gantt view
    compass/              # Direction compass view
    overlap/              # Network overlap view
    systems/              # System dashboards (WA/HA, JA, BaZi, etc.)
    api/                  # API routes for providers
  components/             # Reusable UI components & visualizations
  lib/                    # Utilities (time, direction, CSV, numerology, filters, stats)
  calculators/            # Provider interfaces (TypeScript stubs)
  providers/              # Provider implementations & registry
  store/                  # Zustand state management with localStorage persistence
  schema.ts               # Normalized data schema (Zod + TypeScript types)
  hooks/                  # React hooks (hydration, element size, etc.)
tests/                    # Vitest unit tests + Playwright E2E tests
public/                   # Static assets (sample CSV, SVGs)
```

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS
- **State**: Zustand with localStorage persistence
- **Validation**: Zod
- **Visualization**: D3.js
- **Date/Time**: Luxon, @vvo/tzdb
- **Testing**: Vitest, Playwright, Testing Library
- **Type Safety**: TypeScript (strict mode)

---

## Contributing

1. Review the [Implementation Plan](IMPLEMENTATION_PLAN.md) for roadmap details
2. Check existing tests before making changes
3. Ensure `npm run lint` and `npm run test` pass
4. Follow the existing code style (Prettier + ESLint)

---

## License

Released under the [MIT License](LICENSE).

**Note**: Review third-party calculator licenses before integration. Some providers (Swiss Ephemeris, Human Design, Gene Keys) may require paid licenses. Always annotate privacy notes where required.

---

## Support

For questions, issues, or contributions, please refer to the project's issue tracker or documentation.
