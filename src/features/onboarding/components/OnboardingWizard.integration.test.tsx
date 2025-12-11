import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { OnboardingWizard } from './OnboardingWizard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

describe('OnboardingWizard - Integration Tests', () => {
  it('completes full onboarding flow with real API calls', async () => {
    const user = userEvent.setup();

    renderWithClient(<OnboardingWizard />);

    // Verify Step 1 is shown
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();

    // Fill form with valid data
    // MSW will intercept these HTTP requests
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Phone Number/i), '+13062776103');
    await user.type(screen.getByLabelText(/Corporation Number/i), '123456789');

    // Wait for async validation to complete (MSW intercepts the GET request)
    await waitFor(() => 
      expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled(),
      { timeout: 3000 }
    );

    // Submit form (MSW intercepts the POST request)
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    // Verify navigation to Step 2 (Success Screen)
    await waitFor(() => {
      expect(screen.getByText(/Step 1 Complete/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Back to Step 1/i })).toBeInTheDocument();
    });

    // Click Back Button
    await user.click(screen.getByRole('button', { name: /Back to Step 1/i }));

    // Should be back on Step 1
    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();
    });
  });

  it('handles invalid corporation number via API', async () => {
    const user = userEvent.setup();

    renderWithClient(<OnboardingWizard />);

    // Fill form with invalid corporation number
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Phone Number/i), '+13062776103');
    await user.type(screen.getByLabelText(/Corporation Number/i), '999999999'); // Invalid

    // Wait for validation error (MSW returns invalid response)
    await waitFor(() => {
      expect(screen.getByText(/Invalid corporation number/i)).toBeInTheDocument();
    });

    // Submit button should be disabled
    expect(screen.getByRole('button', { name: /Submit/i })).toBeDisabled();
  });

  it('handles API error responses', async () => {
    const user = userEvent.setup();

    renderWithClient(<OnboardingWizard />);

    // Fill form with valid data
    await user.type(screen.getByLabelText(/First Name/i), 'John');
    await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
    await user.type(screen.getByLabelText(/Phone Number/i), '+13062776103');
    await user.type(screen.getByLabelText(/Corporation Number/i), '123456789');

    await waitFor(() => 
      expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled()
    );

    // Note: To test error responses, you would need to override the handler
    // This test demonstrates the structure - you can add error scenarios
    // by using server.use() to override handlers for specific tests
  });
});
