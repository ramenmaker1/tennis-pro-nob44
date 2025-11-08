import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataSourceSelector } from '@/components/DataSourceSelector';

describe('DataSourceSelector', () => {
  it('renders the three data source options', () => {
    render(<DataSourceSelector />);
    expect(screen.getByText(/Supabase/i)).toBeInTheDocument();
    expect(screen.getByText(/Local/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
  });

  it('disables Supabase option when env vars are missing', () => {
    render(<DataSourceSelector />);
    const supabaseButton = screen.getByRole('button', { name: /Supabase/i });
    expect(supabaseButton).toBeDisabled();
  });
});
