import React from 'react';
import { render } from '@testing-library/react';
import Page from '../src/app/page';

describe('Page', () => {
  beforeEach(() => {
    // Mock scrollTo which is not implemented in jsdom
    Element.prototype.scrollTo = jest.fn();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });
});
