# Geriatric Care Assessment Form

A production-quality single-page Geriatric Care Assessment Form built for visiting nurses assessing elderly patients (aged 60 and above) in home care settings.

Developed as a frontend technical assessment adhering strictly to modern healthcare UX standards, comprehensive validation rules, and the provided Zod 4 schema.

---

## 🛠 Technology Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/) with [Vite+](https://viteplus.dev/)
- **UI Component Library**: [Mantine UI (v9)](https://mantine.dev/)
- **Form Management**: [@mantine/form](https://mantine.dev/form/package/)
- **Date Inputs**: [@mantine/dates](https://mantine.dev/dates/date-input/) & [Day.js](https://day.js.org/)
- **Validation**: [Zod (v4)](https://zod.dev/) with native Standard Schema integration via `schemaResolver`
- **Testing**: [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v20+ or v22+)
- Corepack enabled (uses Yarn 4.18.1)

### Installation

1. Enable Corepack and install dependencies:
   ```bash
   corepack enable
   yarn install
   ```

2. Start the local development server:
   ```bash
   yarn dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

3. Preview production build:
   ```bash
   yarn build
   yarn preview
   ```

---

## 🧪 Testing and Verification

The test suite includes boundary schema tests and end-to-end form integration tests with React Testing Library.

### Run Unit & Integration Tests

```bash
yarn vitest
```

### Run Full Baseline Quality Checks (Lint, Typecheck, Tests, Build)

```bash
yarn test
```

This executes:
1. `vp check`: Code formatting (Oxfmt), linting (Oxlint), and strict TypeScript checking (`tsc --noEmit`).
2. `stylelint`: Stylelint check on stylesheets.
3. `vp test run`: All Vitest unit and component tests.
4. `tsc && vp build`: Production bundle compilation.

---

## ✨ Implemented Features

### 1. Complete 10-Field Clinical Assessment
- **Medical Record Number (`mrn`)**: Mantine `TextInput` validating against `/^MRN-\d{6}$/` format with placeholder `MRN-004821`.
- **Patient Name (`patientName`)**: Mantine `TextInput` requiring 2 to 60 characters with whitespace trimming.
- **Date of Birth (`dateOfBirth`)**: Mantine `DateInput` requiring ISO date string (`YYYY-MM-DD`).
- **Assessment Date (`assessmentDate`)**: Mantine `DateInput` constrained to `maxDate={new Date()}`.
- **Mobility (`mobility`)**: Mantine `Select` dynamically populated directly from `MOBILITY` array, converting identifiers (e.g. `independent`, `cane`, or snake_case `home_visit`) into formatted labels without manual duplication.
- **Barthel Index (`barthelIndex`)**: Mantine `NumberInput` (step 5, min 0, max 100) with `clampBehavior="none"` so user-entered values are validated by Zod rather than silently rounded or clamped.
- **Regular Medications (`medicationCount`)**: Mantine `NumberInput` (min 0, max 30) with `clampBehavior="none"`.
- **Pharmacist Review Requested (`pharmacistReviewRequested`)**: Mantine `Checkbox` triggering validation error if 5 or more medications are entered without pharmacist review (polypharmacy).
- **Next Review Date (`followUpDate`)**: Mantine `DateInput` with cross-field validation ensuring date is strictly after assessment date.
- **Consent (`consentObtained`)**: Mantine `Checkbox` requiring explicit patient/representative consent before save.

### 2. Zod 4 Schema Validation
- Located at `src/features/assessment/schema.ts`.
- Uses exact Zod 4 syntax (`z.iso.date({ error: '...' })`, `{ error: '...' }`).
- Derives `Assessment` type using `z.infer<typeof assessmentSchema>`.
- Cross-field `.refine()` rules for:
  - Age check: Patient must be at least 60 years old on the assessment date (`dateOfBirth <= minus60Years(assessmentDate)`).
  - Polypharmacy check: $\ge 5$ medications requires `pharmacistReviewRequested === true`.
  - Follow-up check: `followUpDate > assessmentDate`.
  - Guarded cross-field refinements ensure empty forms present exactly 9 errors (one per required field) with zero cross-field noise.

### 3. Clean Mantine Form Integration
- Uses Mantine `useForm` with `schemaResolver(assessmentSchema)`.
- Input typing derived cleanly via mapped type from `Assessment` without duplicate handwritten interfaces.
- `validateInputOnBlur: true` for clean blur and submit validation while untouched fields remain quiet.
- No duplicate validation logic in JSX or component files.

### 4. Sample Patient Fixture
- Located at `src/features/assessment/fixtures.ts`.
- "Load Sample Patient" button instantly fills the form with the fictional patient data using Mantine form methods.

### 5. Submission & UI Feedback
- Simulates asynchronous backend submission with an ~800ms delay.
- Save button displays Mantine loading spinner and disables during submission.
- On valid submit, displays a green Mantine `Alert` and outputs parsed, trimmed, validated JSON inside a dark `Code` block.
- Only parsed data from Zod (`assessmentSchema.parse(values)`) is passed to `onSave` and displayed—raw unvalidated state is never shown.

### 6. Design & Accessibility
- Clean healthcare theme inspired by the design mockup.
- Centered Mantine `Container` with white `Paper` card, subtle shadow, and border.
- Responsive 2-column layout on larger viewports collapsing to single-column on smaller screens.
- Design Overview status card with visual feature checklist.

---

## 🔍 Edge Cases Verified

All required test cases and boundary conditions are covered:
- [x] Empty form produces exactly 9 validation errors, one per required field.
- [x] MRN invalid formats (`MRN-4821`) rejected.
- [x] Single-character patient name rejected.
- [x] Patient exactly 60 years old on assessment date accepted.
- [x] Patient one day short of 60 years old on assessment date rejected.
- [x] Mobility value outside `MOBILITY` (e.g. `crutches`) rejected.
- [x] Barthel Index 82 (non-multiple of 5) rejected.
- [x] Barthel Index 105 (> 100) rejected.
- [x] Barthel Index 0 and 100 accepted.
- [x] 4 medications without pharmacist review accepted.
- [x] 5 medications without pharmacist review rejected (polypharmacy).
- [x] 5 medications with pharmacist review accepted.
- [x] Follow-up date equal to assessment date rejected.
- [x] Follow-up date after assessment date accepted.
- [x] Consent false rejected.

---

## ⏱ Time Spent

- **Total approximate time**: 1.5 hours
  - Baseline setup and environment inspection: 20 min
  - Schema implementation and boundary verification: 20 min
  - Form UI and Mantine form wiring: 30 min
  - Tests (Vitest & React Testing Library): 15 min
  - Documentation and baseline verification: 15 min

---

## 🌐 Deployment

The application is bundled into a production build with `yarn build`.

- **Deployment URL**: To be added following continuous deployment setup (e.g. Vercel, Netlify, or Cloudflare Pages).
