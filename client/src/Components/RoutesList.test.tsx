import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Main from './Main';
import RoutesList from './RoutesList';

jest.mock('./Main');

test('renders Main component for / route', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <RoutesList />
    </MemoryRouter>
  );
  expect(Main).toHaveBeenCalled();
});

test('redirects to Main component for unknown routes', () => {
  render(
    <MemoryRouter initialEntries={['/unknown']}>
      <RoutesList />
    </MemoryRouter>
  );
  expect(Main).toHaveBeenCalled();
});