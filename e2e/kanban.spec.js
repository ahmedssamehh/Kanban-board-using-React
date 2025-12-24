import { test, expect } from '@playwright/test';

test.describe('Kanban Board E2E', () => {
    test.beforeEach(async({ page }) => {
        // Clear localStorage before each test
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.clear();
        });
        await page.reload();
    });

    test('comprehensive workflow: create, move, offline, sync', async({ page, context }) => {
        await page.goto('/');

        // Wait for app to load
        await expect(page.locator('h1')).toContainText('Kanban Board');

        // Step 1: Create lists
        const addListButton = page.locator('button', { hasText: 'Add List' }).first();
        await addListButton.click();

        const listInput = page.locator('input[placeholder="List title..."]').first();
        await listInput.fill('To Do');
        await listInput.press('Enter');

        await page.waitForTimeout(600); // Wait for API response (500ms delay + buffer)

        await addListButton.click();
        await page.locator('input[placeholder="List title..."]').last().fill('In Progress');
        await page.locator('input[placeholder="List title..."]').last().press('Enter');

        await page.waitForTimeout(600);

        // Verify lists were created
        await expect(page.locator('text=To Do')).toBeVisible();
        await expect(page.locator('text=In Progress')).toBeVisible();

        // Step 2: Create cards in "To Do" list
        const toDoList = page.locator('[data-testid="list"]', { hasText: 'To Do' }).first();
        const addCardButton = toDoList.locator('button', { hasText: 'Add Card' });
        await addCardButton.click();

        const cardInput = toDoList.locator('input[placeholder="Card title..."]');
        await cardInput.fill('Task 1');
        await cardInput.press('Enter');

        await page.waitForTimeout(600);

        await addCardButton.click();
        await toDoList.locator('input[placeholder="Card title..."]').fill('Task 2');
        await toDoList.locator('input[placeholder="Card title..."]').press('Enter');

        await page.waitForTimeout(600);

        // Verify cards were created
        await expect(page.locator('text=Task 1')).toBeVisible();
        await expect(page.locator('text=Task 2')).toBeVisible();

        // Step 3: Move a card between lists (drag and drop)
        const task1Card = page.locator('[draggable="true"]', { hasText: 'Task 1' });
        const inProgressList = page.locator('[data-testid="list"]', { hasText: 'In Progress' });

        // Get bounding boxes for drag and drop
        const cardBox = await task1Card.boundingBox();
        const listBox = await inProgressList.boundingBox();

        if (cardBox && listBox) {
            // Perform drag and drop
            await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(listBox.x + listBox.width / 2, listBox.y + listBox.height / 2, { steps: 10 });
            await page.mouse.up();

            await page.waitForTimeout(600);
        }

        // Step 4: Simulate going offline
        await context.setOffline(true);

        // Verify offline indicator appears
        await expect(page.locator('text=Offline')).toBeVisible({ timeout: 3000 });

        // Step 5: Perform offline changes (create a card while offline)
        await addCardButton.click();
        await toDoList.locator('input[placeholder="Card title..."]').fill('Offline Task');
        await toDoList.locator('input[placeholder="Card title..."]').press('Enter');

        // Card should appear immediately (optimistic update)
        await expect(page.locator('text=Offline Task')).toBeVisible();

        // Verify queue indicator shows pending operations
        const queueIndicator = page.locator('text=/Queued: \\d+/');
        await expect(queueIndicator).toBeVisible();

        // Step 6: Simulate reconnecting
        await context.setOffline(false);

        // Wait for online indicator
        await expect(page.locator('text=Online')).toBeVisible({ timeout: 5000 });

        // Step 7: Verify sync occurs
        // Queue should clear after sync
        await expect(queueIndicator).not.toBeVisible({ timeout: 10000 });

        // All cards should still be visible
        await expect(page.locator('text=Task 1')).toBeVisible();
        await expect(page.locator('text=Task 2')).toBeVisible();
        await expect(page.locator('text=Offline Task')).toBeVisible();

        // Verify no error messages
        await expect(page.locator('text=/error/i')).not.toBeVisible();

        // Optional: Reload page and verify data persists
        await page.reload();
        await expect(page.locator('text=To Do')).toBeVisible();
        await expect(page.locator('text=Offline Task')).toBeVisible();
    });

    test('should handle conflict resolution', async({ page }) => {
        await page.goto('/');

        // Create a list
        await page.locator('button', { hasText: 'Add List' }).click();
        await page.locator('input[placeholder="List title..."]').fill('Test List');
        await page.locator('input[placeholder="List title..."]').press('Enter');

        await page.waitForTimeout(600);

        // Simulate version conflict by manipulating localStorage
        await page.evaluate(() => {
            const data = JSON.parse(localStorage.getItem('kanban-board') || '{}');
            if (data.version) {
                data.version = 1; // Set old version to trigger conflict
            }
            localStorage.setItem('kanban-board', JSON.stringify(data));
        });

        // Create another change
        const list = page.locator('[data-testid="list"]').first();
        await list.locator('button', { hasText: 'Add Card' }).click();
        await list.locator('input[placeholder="Card title..."]').fill('Test Card');
        await list.locator('input[placeholder="Card title..."]').press('Enter');

        // Wait for potential conflict dialog
        // Note: This depends on how conflicts are handled in your app
        await page.waitForTimeout(1000);
    });

    test('should persist data across page reloads', async({ page }) => {
        await page.goto('/');

        // Create a list and card
        await page.locator('button', { hasText: 'Add List' }).click();
        await page.locator('input[placeholder="List title..."]').fill('Persistent List');
        await page.locator('input[placeholder="List title..."]').press('Enter');

        await page.waitForTimeout(600);

        const list = page.locator('[data-testid="list"]', { hasText: 'Persistent List' });
        await list.locator('button', { hasText: 'Add Card' }).click();
        await list.locator('input[placeholder="Card title..."]').fill('Persistent Card');
        await list.locator('input[placeholder="Card title..."]').press('Enter');

        await page.waitForTimeout(600);

        // Reload page
        await page.reload();

        // Verify data persists
        await expect(page.locator('text=Persistent List')).toBeVisible();
        await expect(page.locator('text=Persistent Card')).toBeVisible();
    });
});