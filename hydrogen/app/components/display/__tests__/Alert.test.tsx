import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Alert} from '../Alert';

describe('Alert', () => {
  it('renders children content', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with a title', () => {
    render(<Alert title="Warning">Body text</Alert>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders with info type by default', () => {
    const {container} = render(<Alert>Info alert</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-blue-50');
  });

  it('renders with success type', () => {
    const {container} = render(<Alert type="success">Success alert</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-green-50');
  });

  it('renders with warning type', () => {
    const {container} = render(<Alert type="warning">Warning alert</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-amber-50');
  });

  it('renders with error type', () => {
    const {container} = render(<Alert type="error">Error alert</Alert>);
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('bg-red-50');
  });

  it('shows dismiss button when dismissible', () => {
    render(<Alert dismissible>Dismissible alert</Alert>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Alert dismissible onDismiss={onDismiss}>
        Dismissible
      </Alert>,
    );
    await user.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('hides after dismissing', async () => {
    const user = userEvent.setup();
    render(<Alert dismissible>Will hide</Alert>);
    await user.click(screen.getByRole('button'));
    expect(screen.queryByText('Will hide')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const {container} = render(
      <Alert className="custom-alert">Custom</Alert>,
    );
    const alert = container.firstChild as HTMLElement;
    expect(alert.className).toContain('custom-alert');
  });

  it('renders with role="alert"', () => {
    render(<Alert>Accessible alert</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
