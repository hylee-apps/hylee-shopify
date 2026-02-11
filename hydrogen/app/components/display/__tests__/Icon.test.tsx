import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Icon} from '../Icon';
import type {IconName} from '../Icon';

describe('Icon', () => {
  it('renders an SVG element', () => {
    const {container} = render(<Icon name="star" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies default size of 24', () => {
    const {container} = render(<Icon name="star" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('applies custom size', () => {
    const {container} = render(<Icon name="star" size={16} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('applies custom className', () => {
    const {container} = render(
      <Icon name="star" className="text-primary" />,
    );
    const svg = container.querySelector('svg');
    expect(svg?.className.baseVal || svg?.getAttribute('class')).toContain(
      'text-primary',
    );
  });

  it('renders different icon names without errors', () => {
    const icons: IconName[] = [
      'menu',
      'x',
      'cart',
      'heart',
      'search',
      'user',
      'check',
      'plus',
      'minus',
      'trash',
      'edit',
      'shield',
      'truck',
      'package',
      'star',
    ];

    icons.forEach((name) => {
      const {container} = render(<Icon name={name} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    const {container} = render(<Icon name="star" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });
});
