import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const user = userEvent.setup();
    
    // Mock valid form submission
    vi.mocked(api.validateCorporationNumber).mockResolvedValue({
      valid: true,
      corporationNumber: '123456789',
    });
    vi.mocked(api.submitProfile).mockResolvedValue(undefined);

    renderWithClient(<OnboardingWizard />);

    // Verify Step 1 is shown
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();

    // Fill form - userEvent.type automatically handles focus, typing, and blur (triggers validation)
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Phone Number/i), '+13062776103');
    await user.type(screen.getByLabelText(/Corporation Number/i), '123456789');

    // Wait for button to enable (validation has been triggered by userEvent.type blur)
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled());

    // Submit
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    // Verify navigation to Step 2 (Success Screen)
    await waitFor(() => {
      expect(screen.getByText(/Step 1 Complete/i)).toBeInTheDocument();
      // Check for the Main Back button
      expect(screen.getByRole('button', { name: /Back to Step 1/i })).toBeInTheDocument();
    });

    // Click Back Button
    await user.click(screen.getByRole('button', { name: /Back to Step 1/i }));

    // Should be back on Step 1
    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });
  });
});
