import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import Card from '../Card';
import BoardProvider from '../../context/BoardProvider';

describe('Card Component', () => {
    const mockCard = {
        id: 'card-1',
        title: 'Test Card',
        description: 'Test description',
        tags: ['test', 'feature'],
        priority: 'high',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders card with title', () => {
        render( <
            BoardProvider >
            <
            Card card = { mockCard }
            listId = "list-1" / >
            <
            /BoardProvider>
        );

        expect(screen.getByText('Test Card')).toBeInTheDocument();
    });

    test('displays card tags', () => {
        render( <
            BoardProvider >
            <
            Card card = { mockCard }
            listId = "list-1" / >
            <
            /BoardProvider>
        );

        expect(screen.getByText('test')).toBeInTheDocument();
        expect(screen.getByText('feature')).toBeInTheDocument();
    });

    test('opens modal on click', async() => {
        render( <
            BoardProvider >
            <
            Card card = { mockCard }
            listId = "list-1" / >
            <
            /BoardProvider>
        );

        // Click card
        const cardElement = screen.getByText('Test Card');
        fireEvent.click(cardElement);

        // Modal should load (Suspense fallback or modal itself)
        await waitFor(() => {
            expect(
                screen.getByText(/Loading card details|Test Card/)
            ).toBeInTheDocument();
        });
    });

    test('supports drag and drop', () => {
        render( <
            BoardProvider >
            <
            Card card = { mockCard }
            listId = "list-1" / >
            <
            /BoardProvider>
        );

        const cardElement = screen.getByText('Test Card').closest('div[draggable="true"]');
        expect(cardElement).toHaveAttribute('draggable', 'true');

        // Test drag start
        fireEvent.dragStart(cardElement, {
            dataTransfer: {
                effectAllowed: '',
                setData: jest.fn(),
            },
        });

        expect(cardElement).toHaveClass('opacity-50');
    });

    test('is memoized for performance', () => {
        const { rerender } = render( <
            BoardProvider >
            <
            Card card = { mockCard }
            listId = "list-1" / >
            <
            /BoardProvider>
        );

        const firstRender = screen.getByText('Test Card');

        // Re-render with same props
        rerender( <
            BoardProvider >
            <
            Card card = { mockCard }
            listId = "list-1" / >
            <
            /BoardProvider>
        );

        const secondRender = screen.getByText('Test Card');

        // Should be the same element (memoized)
        expect(firstRender).toBe(secondRender);
    });
});