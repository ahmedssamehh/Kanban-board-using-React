import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import BoardProvider from '../../context/BoardProvider';
import Board from '../Board';

// Mock the API module
jest.mock('../../services/api');

describe('Board Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders board with header', () => {
        render( <
            BoardProvider >
            <
            Board / >
            <
            /BoardProvider>
        );

        expect(screen.getByText('+ Add List')).toBeInTheDocument();
    });

    test('can add a new list', async() => {
        render( <
            BoardProvider >
            <
            Board / >
            <
            /BoardProvider>
        );

        // Click add list button
        const addButton = screen.getByText('+ Add List');
        fireEvent.click(addButton);

        // Input appears
        const input = screen.getByPlaceholderText('Enter list title...');
        expect(input).toBeInTheDocument();

        // Type list name
        fireEvent.change(input, { target: { value: 'Test List' } });

        // Press Enter
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        // List should appear
        await waitFor(() => {
            expect(screen.getByText('Test List')).toBeInTheDocument();
        });
    });

    test('displays active lists only', async() => {
        // Pre-populate with lists using correct storage key
        const initialState = {
            lists: [
                { id: '1', title: 'Active List', archived: false },
                { id: '2', title: 'Archived List', archived: true },
            ],
            cards: { '1': [], '2': [] },
        };

        localStorage.setItem('kanban_board_data', JSON.stringify(initialState));

        render( <
            BoardProvider >
            <
            Board / >
            <
            /BoardProvider>
        );

        // Wait for lists to be loaded and rendered
        await waitFor(() => {
            expect(screen.getByText('Active List')).toBeInTheDocument();
        });

        // Only active list should be visible, archived should not
        expect(screen.queryByText('Archived List')).not.toBeInTheDocument();
    });

    test('validates list title input', async() => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        render( <
            BoardProvider >
            <
            Board / >
            <
            /BoardProvider>
        );

        // Click add list
        fireEvent.click(screen.getByText('+ Add List'));

        // Submit empty title
        const input = screen.getByPlaceholderText('Enter list title...');
        fireEvent.keyDown(input, { key: 'Enter' });

        // Should not create list (no error shown for empty, just ignored)
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();

        alertSpy.mockRestore();
    });
});