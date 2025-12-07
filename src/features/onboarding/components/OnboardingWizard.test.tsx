import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from './OnboardingWizard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as api from '../api';

// Mock the API module
vi.mock('../api');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  const client = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={client}>
        {ui}
      </QueryClientProvider>
    ),
    client,
  };
};

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('navigates to success step and supports back button', async () => {
    // Mock valid form submission
    vi.mocked(api.validateCorporationNumber).mockResolvedValue({
      valid: true,
      corporationNumber: '123456789',
    });
    vi.mocked(api.submitProfile).mockResolvedValue(undefined);

    renderWithClient(<OnboardingWizard />);

    // Verify Step 1 is shown
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();

    // Fill form to valid state
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+13062776103' } });
    fireEvent.change(screen.getByLabelText(/Corporation Number/i), { target: { value: '123456789' } });
    
    // Blur to validate
    fireEvent.blur(screen.getByLabelText(/First Name/i));
    fireEvent.blur(screen.getByLabelText(/Last Name/i));
    fireEvent.blur(screen.getByLabelText(/Phone Number/i));
    fireEvent.blur(screen.getByLabelText(/Corporation Number/i));

    // Wait for button to enable
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled());

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    // Verify navigation to Step 2 (Success Screen)
    await waitFor(() => {
      expect(screen.getByText(/Step 1 Complete/i)).toBeInTheDocument();
      // Check for the Main Back button
      expect(screen.getByRole('button', { name: /Back to Step 1/i })).toBeInTheDocument();
    });

    // Click Back Button
    fireEvent.click(screen.getByRole('button', { name: /Back to Step 1/i }));

    // Should be back on Step 1
    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });
  });
});
