import React from 'react';
import { render, act } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

test('renders LoadingSpinner component correctly before and after delay', async () => {

    jest.useFakeTimers();

    const { container } = render(
        <LoadingSpinner />
    );
    let spinnerTextDiv = container.querySelector(".LoadingSpinner-text");
    expect(spinnerTextDiv).toHaveTextContent('Loading ...');

    console.log("Test logic: advancing time.")

    await act(async () => {
        jest.advanceTimersByTime(5001);
    });

    jest.useRealTimers();

    spinnerTextDiv = container.querySelector(".LoadingSpinner-text");
    expect(spinnerTextDiv).toHaveTextContent('Extended loading detected - server warming up - please wait 120s and reload page if necessary ...');
});
