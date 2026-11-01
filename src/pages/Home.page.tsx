import { AssessmentForm } from '../features/assessment/AssessmentForm';

export function HomePage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f4f7fa', paddingBottom: '3rem' }}>
      <AssessmentForm />
    </main>
  );
}
