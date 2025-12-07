import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PersonalDetailsStep } from './PersonalDetailsStep';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as api from '../api';
import { AxiosError } from 'axios';

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

describe('PersonalDetailsStep', () => {
  const onNextMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    onNextMock.mockReset();
  });

  it('renders all form fields and step indicator', () => {
    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);
    
    // Check for Step indicator
    expect(screen.getByText(/Step 1 of 5/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Corporation Number/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
  });

  it('disables submit button initially', () => {
    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);
    expect(screen.getByRole('button', { name: /Submit/i })).toBeDisabled();
  });

  it('validates required fields on blur', async () => {
    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);
    
    const firstNameInput = screen.getByLabelText(/First Name/i);
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
    });
  });

  it('validates phone number format and Canadian area code separately', async () => {
    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);
    
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    
    // Test 1: Invalid format - missing +1
    fireEvent.change(phoneInput, { target: { value: '123' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.getByText(/Phone number must start with \+1 and contain exactly 10 digits/i)).toBeInTheDocument();
    });

    // Test 2: Invalid format - wrong number of digits (too few)
    fireEvent.change(phoneInput, { target: { value: '+112345' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.getByText(/Phone number must start with \+1 and contain exactly 10 digits/i)).toBeInTheDocument();
      expect(screen.queryByText(/Phone number must be a valid Canadian number/i)).not.toBeInTheDocument();
    });

    // Test 3: Invalid format - wrong number of digits (too many)
    fireEvent.change(phoneInput, { target: { value: '+112345678901' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.getByText(/Phone number must start with \+1 and contain exactly 10 digits/i)).toBeInTheDocument();
      expect(screen.queryByText(/Phone number must be a valid Canadian number/i)).not.toBeInTheDocument();
    });

    // Test 4: Valid format but US Area Code (e.g., 212 for NYC) -> Should show Canadian error only
    fireEvent.change(phoneInput, { target: { value: '+12125551234' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.queryByText(/Phone number must start with \+1 and contain exactly 10 digits/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Phone number must be a valid Canadian number/i)).toBeInTheDocument();
    });

    // Test 5: Valid Canadian format (306 for Saskatchewan) -> Should Pass
    fireEvent.change(phoneInput, { target: { value: '+13062776103' } });
    fireEvent.blur(phoneInput);
    await waitFor(() => {
      expect(screen.queryByText(/Phone number must start with \+1 and contain exactly 10 digits/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Phone number must be a valid Canadian number/i)).not.toBeInTheDocument();
    });
  });

  it('validates corporation number asynchronously', async () => {
    // Mock API response for valid corporation number
    vi.mocked(api.validateCorporationNumber).mockResolvedValue({
      valid: true,
      corporationNumber: '123456789',
    });

    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);
    
    const corpInput = screen.getByLabelText(/Corporation Number/i);
    
    fireEvent.change(corpInput, { target: { value: '123456789' } });
    fireEvent.blur(corpInput);

    await waitFor(() => {
      expect(api.validateCorporationNumber).toHaveBeenCalledWith('123456789');
      expect(screen.queryByText(/Invalid corporation number/i)).not.toBeInTheDocument();
    });
  });

  it('shows error for invalid corporation number', async () => {
    // Mock API response for invalid corporation number
    vi.mocked(api.validateCorporationNumber).mockResolvedValue({
      valid: false,
      message: 'Invalid corporation number',
    });

    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);
    
    const corpInput = screen.getByLabelText(/Corporation Number/i);
    
    fireEvent.change(corpInput, { target: { value: '999999999' } });
    fireEvent.blur(corpInput);

    await waitFor(() => {
      expect(api.validateCorporationNumber).toHaveBeenCalledWith('999999999');
      expect(screen.getByText(/Invalid corporation number/i)).toBeInTheDocument();
    });
  });

  it('displays API error message on failed submission', async () => {
    vi.mocked(api.validateCorporationNumber).mockResolvedValue({
      valid: true,
      corporationNumber: '123456789',
    });
    
    // Create a real AxiosError to ensure instanceof check passes
    const error = new AxiosError('Server Error');
    error.response = {
      data: { message: 'Something went wrong on the server' },
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
    };
    
    vi.mocked(api.submitProfile).mockRejectedValue(error);
    
    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+13062776103' } });
    fireEvent.change(screen.getByLabelText(/Corporation Number/i), { target: { value: '123456789' } });
    
    // Validate
    fireEvent.blur(screen.getByLabelText(/First Name/i));
    fireEvent.blur(screen.getByLabelText(/Last Name/i));
    fireEvent.blur(screen.getByLabelText(/Phone Number/i));
    fireEvent.blur(screen.getByLabelText(/Corporation Number/i));
    
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled());

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong on the server/i)).toBeInTheDocument();
    });
  });

  it('submits the form when all fields are valid and triggers onNext', async () => {
    vi.mocked(api.validateCorporationNumber).mockResolvedValue({
      valid: true,
      corporationNumber: '123456789',
    });
    vi.mocked(api.submitProfile).mockResolvedValue(undefined);
    
    renderWithClient(<PersonalDetailsStep onNext={onNextMock} />);

    // Fill form
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '+13062776103' } });
    fireEvent.change(screen.getByLabelText(/Corporation Number/i), { target: { value: '123456789' } });
    
    // Trigger validation to enable button
    fireEvent.blur(screen.getByLabelText(/First Name/i));
    fireEvent.blur(screen.getByLabelText(/Last Name/i));
    fireEvent.blur(screen.getByLabelText(/Phone Number/i));
    fireEvent.blur(screen.getByLabelText(/Corporation Number/i));
    
    await waitFor(() => expect(screen.queryByText(/Invalid corporation number/i)).not.toBeInTheDocument());

    // Submit button should be enabled
    await waitFor(() => expect(screen.getByRole('button', { name: /Submit/i })).not.toBeDisabled());

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(api.submitProfile).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        phone: '+13062776103',
        corporationNumber: '123456789',
      });
      expect(onNextMock).toHaveBeenCalled();
    });
  });
});
