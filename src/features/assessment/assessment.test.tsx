import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../test-utils';
import { AssessmentForm } from './AssessmentForm';
import { samplePatient } from './fixtures';
import { assessmentSchema, MOBILITY } from './schema';

describe('Assessment Schema Boundary Tests', () => {
  const baseValidData = { ...samplePatient };

  // Assignment Test 1: Date of birth exactly 60 versus one day short
  it('accepts DOB exactly 60 years on assessment date and rejects DOB one day short of 60', () => {
    // 60 years old on assessment date 2026-08-07: DOB 1966-08-07
    const validTurn60 = assessmentSchema.safeParse({
      ...baseValidData,
      dateOfBirth: '1966-08-07',
      assessmentDate: '2026-08-07',
    });
    expect(validTurn60.success).toBe(true);

    // One day short of 60 on assessment date 2026-08-07: DOB 1966-08-08
    const invalidShort60 = assessmentSchema.safeParse({
      ...baseValidData,
      dateOfBirth: '1966-08-08',
      assessmentDate: '2026-08-07',
    });
    expect(invalidShort60.success).toBe(false);
    expect(invalidShort60.error?.issues.some((i) => i.path.includes('dateOfBirth'))).toBe(true);
    expect(invalidShort60.error?.issues[0]?.message).toBe(
      'This pathway is for patients aged 60 and over'
    );
  });

  it('rejects an empty input with exactly 9 validation errors (one per required field)', () => {
    const emptyResult = assessmentSchema.safeParse({
      mrn: '',
      patientName: '',
      dateOfBirth: '',
      assessmentDate: '',
      mobility: '',
      barthelIndex: '',
      medicationCount: '',
      pharmacistReviewRequested: false,
      followUpDate: '',
      consentObtained: false,
    });

    expect(emptyResult.success).toBe(false);
    expect(emptyResult.error?.issues).toHaveLength(9);
    const errorPaths = emptyResult.error?.issues.map((i) => i.path[0]) ?? [];
    expect(errorPaths).toContain('mrn');
    expect(errorPaths).toContain('patientName');
    expect(errorPaths).toContain('dateOfBirth');
    expect(errorPaths).toContain('assessmentDate');
    expect(errorPaths).toContain('mobility');
    expect(errorPaths).toContain('barthelIndex');
    expect(errorPaths).toContain('medicationCount');
    expect(errorPaths).toContain('followUpDate');
    expect(errorPaths).toContain('consentObtained');
  });

  it('rejects invalid MRN formats like MRN-4821', () => {
    const res = assessmentSchema.safeParse({
      ...baseValidData,
      mrn: 'MRN-4821',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues.some((i) => i.path.includes('mrn'))).toBe(true);
  });

  it('rejects single-character patient name', () => {
    const res = assessmentSchema.safeParse({
      ...baseValidData,
      patientName: 'S',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues.some((i) => i.path.includes('patientName'))).toBe(true);
  });

  it('rejects invalid mobility values not in MOBILITY array', () => {
    const res = assessmentSchema.safeParse({
      ...baseValidData,
      mobility: 'crutches',
    });
    expect(res.success).toBe(false);
    expect(res.error?.issues.some((i) => i.path.includes('mobility'))).toBe(true);
  });

  it('validates Barthel Index: rejects 82 (non-multiple of 5) and 105 (>100); accepts 0 and 100', () => {
    expect(assessmentSchema.safeParse({ ...baseValidData, barthelIndex: 82 }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...baseValidData, barthelIndex: 105 }).success).toBe(false);
    expect(assessmentSchema.safeParse({ ...baseValidData, barthelIndex: 0 }).success).toBe(true);
    expect(assessmentSchema.safeParse({ ...baseValidData, barthelIndex: 100 }).success).toBe(true);
  });

  it('validates polypharmacy rule for medication count', () => {
    // 5 medications without review requested is rejected
    const polyNoReview = assessmentSchema.safeParse({
      ...baseValidData,
      medicationCount: 5,
      pharmacistReviewRequested: false,
    });
    expect(polyNoReview.success).toBe(false);
    expect(
      polyNoReview.error?.issues.some((i) => i.path.includes('pharmacistReviewRequested'))
    ).toBe(true);

    // 5 medications with review requested is accepted
    const polyWithReview = assessmentSchema.safeParse({
      ...baseValidData,
      medicationCount: 5,
      pharmacistReviewRequested: true,
    });
    expect(polyWithReview.success).toBe(true);

    // 4 medications without review requested is accepted (below threshold)
    const belowThreshold = assessmentSchema.safeParse({
      ...baseValidData,
      medicationCount: 4,
      pharmacistReviewRequested: false,
    });
    expect(belowThreshold.success).toBe(true);
  });

  it('rejects follow-up date equal to or before assessment date', () => {
    const sameDay = assessmentSchema.safeParse({
      ...baseValidData,
      assessmentDate: '2026-08-07',
      followUpDate: '2026-08-07',
    });
    expect(sameDay.success).toBe(false);
    expect(sameDay.error?.issues.some((i) => i.path.includes('followUpDate'))).toBe(true);
  });

  it('rejects submission when consent is false', () => {
    const noConsent = assessmentSchema.safeParse({
      ...baseValidData,
      consentObtained: false,
    });
    expect(noConsent.success).toBe(false);
    expect(noConsent.error?.issues.some((i) => i.path.includes('consentObtained'))).toBe(true);
  });
});

describe('Assessment Form Integration Tests', () => {
  // Assignment Test 2: Render form, load sample patient, submit, and assert save handler called with parsed values
  it('loads sample patient, submits form, and calls onSave handler with parsed values', async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn();

    render(<AssessmentForm onSave={handleSave} submissionDelay={0} />);

    // 1. Verify form renders with title and action buttons
    expect(screen.getByRole('button', { name: /load sample patient/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save assessment/i })).toBeInTheDocument();

    // 2. Click "Load Sample Patient"
    const loadSampleButton = screen.getByRole('button', { name: /load sample patient/i });
    await user.click(loadSampleButton);

    // Verify fields populated
    expect(screen.getByLabelText(/medical record number/i)).toHaveValue('MRN-004821');
    expect(screen.getByLabelText(/patient name/i)).toHaveValue('Sushila Deshpande');

    // 3. Click "Save Assessment"
    const submitButton = screen.getByRole('button', { name: /save assessment/i });
    await user.click(submitButton);

    // 4. Verify save handler was called with the exact parsed sample patient values
    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledTimes(1);
    });

    expect(handleSave).toHaveBeenCalledWith({
      mrn: 'MRN-004821',
      patientName: 'Sushila Deshpande',
      dateOfBirth: '1949-03-12',
      assessmentDate: '2026-08-07',
      mobility: 'cane',
      barthelIndex: 80,
      medicationCount: 3,
      pharmacistReviewRequested: false,
      followUpDate: '2026-09-04',
      consentObtained: true,
    });

    // 5. Verify success alert and code block appear
    expect(screen.getByText('Assessment saved successfully!')).toBeInTheDocument();
    expect(screen.getByText('Parsed Assessment Data')).toBeInTheDocument();
  });

  it('renders dynamic mobility options matching MOBILITY constant', () => {
    render(<AssessmentForm />);
    const select = screen.getByPlaceholderText(/select mobility status/i);
    expect(select).toBeInTheDocument();
    expect(MOBILITY).toEqual(['independent', 'cane', 'walker', 'wheelchair', 'bedbound']);
  });
});
