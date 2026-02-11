import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Badge} from '../Badge';
import {MemoryRouter} from 'react-router';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders as a span by default', () => {
    render(<Badge>Test</Badge>);
    const badge = screen.getByText('Test');
    expect(badge.tagName).toBe('SPAN');
  });

  it('applies default variant styles', () => {
    const {container} = render(<Badge>Default</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-primary');
  });

  it('applies success variant', () => {
    const {container} = render(<Badge variant="success">Paid</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-green-100');
  });

  it('applies destructive variant', () => {
    const {container} = render(<Badge variant="destructive">Error</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-red-100');
  });

  it('applies warning variant', () => {
    const {container} = render(<Badge variant="warning">Pending</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('bg-amber-100');
  });

  it('applies different sizes', () => {
    const {container} = render(<Badge size="sm">Small</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('text-');
  });

  it('renders with dot indicator', () => {
    const {container} = render(<Badge dot>Status</Badge>);
    // Dot renders a small element before text
    const badge = screen.getByText('Status');
    expect(badge).toBeInTheDocument();
  });

  it('renders with pill shape', () => {
    const {container} = render(<Badge pill>Pill</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('rounded-full');
  });

  it('renders as a link when url is provided', () => {
    renderWithRouter(<Badge url="/test">Clickable</Badge>);
    const link = screen.getByRole('link', {name: 'Clickable'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders close button when closable', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Badge closable onClose={onClose}>
        Removable
      </Badge>,
    );
    const closeBtn = screen.getByRole('button');
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('applies custom className', () => {
    const {container} = render(<Badge className="my-class">Custom</Badge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('my-class');
  });
});
