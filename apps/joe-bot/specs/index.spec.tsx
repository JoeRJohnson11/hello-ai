import React from 'react';
import { render } from '@testing-library/react';
import Page from '../src/app/page';

const mockFetch = jest.fn();

describe('Page', () => {
  beforeEach(() => {
    // Mock scrollTo which is not implemented in jsdom
    Element.prototype.scrollTo = jest.fn();

    // Mock fetch for message persistence
    mockFetch.mockReset();
    (global as unknown as { fetch: typeof fetch }).fetch = mockFetch;

    // Default mock response for /api/messages
    mockFetch.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.endsWith('/api/messages')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ messages: [] }),
        });
      }
      return Promise.reject(new Error(`Unmocked: ${url}`));
    });
  });

  it('should render successfully', () => {
    const { baseElement } = render(<Page />);
    expect(baseElement).toBeTruthy();
  });
});
