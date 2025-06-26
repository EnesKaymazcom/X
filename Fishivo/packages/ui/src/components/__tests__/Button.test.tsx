import React from 'react';
import renderer from 'react-test-renderer';
import { Button } from '../Button';

// Mock theme
jest.mock('@fishivo/shared', () => ({
  theme: {
    colors: {
      primary: '#007AFF',
      secondary: '#5856D6',
      surface: '#F2F2F7',
      background: '#FFFFFF',
      text: '#000000',
      border: '#C7C7CC',
      error: '#FF3B30',
      success: '#34C759',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
    borderRadius: {
      md: 8,
    },
    typography: {
      sm: 14,
      medium: '600',
    },
  },
}));

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with default props', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress}>Test Button</Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when disabled', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} disabled>
        Disabled Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders correctly when loading', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} loading>
        Loading Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders primary variant correctly', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} variant="primary">
        Primary Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders secondary variant correctly', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} variant="secondary">
        Secondary Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders small size correctly', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} size="sm">
        Small Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders large size correctly', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} size="lg">
        Large Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('renders fullWidth correctly', () => {
    const tree = renderer.create(
      <Button onPress={mockOnPress} fullWidth>
        Full Width Button
      </Button>
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});