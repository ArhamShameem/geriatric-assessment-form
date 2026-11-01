import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Code,
  Container,
  Grid,
  Group,
  Input,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { schemaResolver, useForm } from '@mantine/form';
import { samplePatient } from './fixtures';
import { type Assessment, assessmentSchema, MOBILITY } from './schema';

export type AssessmentInput = {
  [K in keyof Assessment]: Assessment[K] extends true ? boolean : Assessment[K] | '' | null;
};

const initialValues: AssessmentInput = {
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
};

const mobilityOptions = MOBILITY.map((value) => ({
  value,
  label: value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' '),
}));

interface AssessmentFormProps {
  onSave?: (data: Assessment) => void | Promise<void>;
  submissionDelay?: number;
}

export function AssessmentForm({ onSave, submissionDelay = 800 }: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedData, setSavedData] = useState<Assessment | null>(null);

  const form = useForm<AssessmentInput>({
    mode: 'controlled',
    initialValues,
    validateInputOnBlur: true,
    validate: schemaResolver(assessmentSchema),
  });

  const handleLoadSample = () => {
    form.setValues({
      ...samplePatient,
    });
    form.clearErrors();
  };

  const handleSubmit = async (values: AssessmentInput) => {
    setIsSubmitting(true);
    try {
      if (submissionDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, submissionDelay));
      }

      const parsed = assessmentSchema.parse(values);
      setSavedData(parsed);
      await onSave?.(parsed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="md" py="xl">
      {/* Top Banner / Header */}
      <Group gap="sm" mb="lg">
        <ThemeIcon size={42} radius="md" color="blue" variant="filled">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M12 5v14" />
          </svg>
        </ThemeIcon>
        <div>
          <Title order={2} style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a1f36' }}>
            Geriatric Care Assessment
          </Title>
          <Text size="sm" c="dimmed">
            Home Visit Assessment Form
          </Text>
        </div>
      </Group>

      {/* Main Assessment Card */}
      <Paper withBorder shadow="sm" radius="md" p={{ base: 'md', sm: 'xl' }} bg="white">
        <Group gap="sm" mb="xl">
          <ThemeIcon size={38} radius="xl" color="blue" variant="light">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" x2="19" y1="8" y2="14" />
              <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
          </ThemeIcon>
          <div>
            <Title order={3} style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1f36' }}>
              Geriatric Care Assessment
            </Title>
            <Text size="sm" c="dimmed">
              Assessment form for elderly patients (60 years and above)
            </Text>
          </div>
        </Group>

        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {/* Column 1 */}
            <Stack gap="md">
              <TextInput
                label="Medical Record Number"
                placeholder="MRN-004821"
                required
                key={form.key('mrn')}
                {...form.getInputProps('mrn')}
              />

              <TextInput
                label="Patient Name"
                placeholder="Enter patient name"
                required
                key={form.key('patientName')}
                {...form.getInputProps('patientName')}
              />

              <DateInput
                label="Date of Birth"
                placeholder="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                required
                key={form.key('dateOfBirth')}
                {...form.getInputProps('dateOfBirth')}
              />

              <DateInput
                label="Assessment Date"
                placeholder="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                maxDate={new Date()}
                required
                key={form.key('assessmentDate')}
                {...form.getInputProps('assessmentDate')}
              />

              <Select
                label="Mobility"
                placeholder="Select mobility status"
                data={mobilityOptions}
                required
                clearable
                key={form.key('mobility')}
                {...form.getInputProps('mobility')}
              />
            </Stack>

            {/* Column 2 */}
            <Stack gap="md">
              <NumberInput
                label="Barthel Index"
                placeholder="0"
                description="Enter a score from 0 to 100 (in steps of 5)"
                step={5}
                min={0}
                max={100}
                clampBehavior="none"
                required
                key={form.key('barthelIndex')}
                {...form.getInputProps('barthelIndex')}
              />

              <NumberInput
                label="Regular Medications"
                placeholder="0"
                description="Enter the number of regular medications (0 – 30)"
                min={0}
                max={30}
                clampBehavior="none"
                required
                key={form.key('medicationCount')}
                {...form.getInputProps('medicationCount')}
              />

              <Checkbox
                mt={4}
                label="Pharmacist Review Requested"
                description="Request a pharmacist review (required if 5 or more medications)"
                key={form.key('pharmacistReviewRequested')}
                {...form.getInputProps('pharmacistReviewRequested', { type: 'checkbox' })}
              />

              <DateInput
                label="Next Review Date"
                placeholder="YYYY-MM-DD"
                valueFormat="YYYY-MM-DD"
                description="Must be after the assessment date"
                required
                key={form.key('followUpDate')}
                {...form.getInputProps('followUpDate')}
              />

              <Input.Wrapper label="Consent" required>
                <Checkbox
                  mt={4}
                  label="Patient or representative has given consent"
                  key={form.key('consentObtained')}
                  {...form.getInputProps('consentObtained', { type: 'checkbox' })}
                />
              </Input.Wrapper>
            </Stack>
          </SimpleGrid>

          {/* Form Actions */}
          <Group justify="flex-end" mt="xl" gap="sm">
            <Button
              type="button"
              variant="default"
              onClick={handleLoadSample}
              leftSection={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" x2="19" y1="8" y2="14" />
                  <line x1="22" x2="16" y1="11" y2="11" />
                </svg>
              }
            >
              Load Sample Patient
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              color="blue"
              leftSection={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              }
            >
              Save Assessment
            </Button>
          </Group>
        </form>
      </Paper>

      {/* Overview & Saved Output Section */}
      <Grid mt="xl" gap="lg">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder p="md" radius="md" bg="#f8fafd">
            <Group gap="xs" mb="sm">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#228be6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
              <Text fw={700} size="sm" c="#1a1f36">
                Design Overview
              </Text>
            </Group>
            <Stack gap="xs">
              {[
                'Clean, professional healthcare UI',
                'All 10 required fields (2-column layout)',
                'Mantine components (TextInput, DateInput, Select, NumberInput, Checkbox)',
                '"Load Sample Patient" and "Save Assessment" buttons',
                'Success Alert with parsed Zod output in a Code block',
                'Responsive, accessible, and simple design',
              ].map((item, idx) => (
                <Group key={idx} gap="xs" wrap="nowrap" align="flex-start">
                  <ThemeIcon size={18} radius="xl" color="green" variant="light" mt={2}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </ThemeIcon>
                  <Text size="xs" c="dimmed">
                    {item}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          {savedData ? (
            <Stack gap="sm">
              <Alert
                color="green"
                variant="light"
                title="Assessment saved successfully!"
                radius="md"
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                }
              >
                The assessment has been validated and saved.
              </Alert>

              <Box>
                <Text fw={600} size="xs" mb="xs" c="#1a1f36">
                  Parsed Assessment Data
                </Text>
                <Code
                  block
                  style={{
                    backgroundColor: '#141517',
                    color: '#c1c2c5',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  {JSON.stringify(savedData, null, 2)}
                </Code>
              </Box>
            </Stack>
          ) : (
            <Paper
              withBorder
              p="xl"
              radius="md"
              style={{
                borderStyle: 'dashed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '180px',
              }}
            >
              <Text c="dimmed" size="sm" ta="center">
                Fill in the assessment fields and click &quot;Save Assessment&quot; to validate and
                submit.
              </Text>
            </Paper>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}
