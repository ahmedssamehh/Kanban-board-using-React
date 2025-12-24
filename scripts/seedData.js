/**
 * Data Seeding Script for Performance Testing
 * 
 * Generates 500+ dummy cards distributed across multiple lists
 * and saves them to localStorage for performance testing.
 * 
 * Usage:
 *   node scripts/seedData.js
 * 
 * Or in browser console:
 *   Run this script content directly in browser console
 */

import { v4 as uuidv4 } from 'uuid';

// Sample data for realistic card content
const priorities = ['low', 'medium', 'high'];
const tags = [
    'bug', 'feature', 'enhancement', 'documentation', 'testing',
    'design', 'performance', 'security', 'refactor', 'urgent',
    'backend', 'frontend', 'database', 'api', 'ui/ux'
];

const titles = [
    'Fix login authentication issue',
    'Add user profile page',
    'Implement search functionality',
    'Update documentation',
    'Optimize database queries',
    'Design new landing page',
    'Fix memory leak in component',
    'Add unit tests for API',
    'Refactor legacy code',
    'Implement caching layer',
    'Add dark mode support',
    'Fix responsive layout bugs',
    'Integrate payment gateway',
    'Add email notifications',
    'Implement file upload feature',
    'Optimize image loading',
    'Add keyboard shortcuts',
    'Fix security vulnerability',
    'Add accessibility features',
    'Implement rate limiting'
];

const descriptions = [
    'This is a critical issue that needs immediate attention. Users are reporting problems with the current implementation.',
    'We need to implement this feature to improve user experience and add value to our application.',
    'This task involves refactoring existing code to improve maintainability and performance.',
    'Documentation needs to be updated to reflect recent changes in the codebase.',
    'Performance optimization is required to handle increasing user load.',
    'Design improvements will make the interface more intuitive and user-friendly.',
    'This is a technical debt item that should be addressed in the next sprint.',
    'Security patch required to address recently discovered vulnerabilities.',
    'Testing coverage needs to be improved for better code quality.',
    'This enhancement will add significant value to our users and stakeholders.'
];

/**
 * Generate a random card
 */
function generateCard(listId) {
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    // Random 2-4 tags per card
    const numTags = Math.floor(Math.random() * 3) + 2;
    const cardTags = [];
    for (let i = 0; i < numTags; i++) {
        const tag = tags[Math.floor(Math.random() * tags.length)];
        if (!cardTags.includes(tag)) {
            cardTags.push(tag);
        }
    }

    return {
        id: uuidv4(),
        title: `${title} #${Math.floor(Math.random() * 1000)}`,
        description,
        priority,
        tags: cardTags,
        createdAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        lastModifiedAt: Date.now(),
        version: 1
    };
}

/**
 * Generate seed data with specified number of cards
 */
function generateSeedData(totalCards = 500) {
    console.log(`🌱 Generating seed data with ${totalCards} cards...`);

    // Create 5 lists for distributing cards
    const lists = [{
            id: uuidv4(),
            name: 'Backlog',
            archived: false,
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            version: 1
        },
        {
            id: uuidv4(),
            name: 'To Do',
            archived: false,
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            version: 1
        },
        {
            id: uuidv4(),
            name: 'In Progress',
            archived: false,
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            version: 1
        },
        {
            id: uuidv4(),
            name: 'Review',
            archived: false,
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            version: 1
        },
        {
            id: uuidv4(),
            name: 'Done',
            archived: false,
            createdAt: Date.now(),
            lastModifiedAt: Date.now(),
            version: 1
        }
    ];

    // Distribute cards across lists (weighted distribution - more in early lists)
    const distribution = [0.3, 0.25, 0.2, 0.15, 0.1]; // 30%, 25%, 20%, 15%, 10%
    const cards = {};

    lists.forEach((list, index) => {
        const numCards = Math.floor(totalCards * distribution[index]);
        cards[list.id] = [];

        for (let i = 0; i < numCards; i++) {
            cards[list.id].push(generateCard(list.id));
        }

        console.log(`  ✅ Created ${numCards} cards for "${list.name}"`);
    });

    // Add remaining cards to first list to reach exact total
    const currentTotal = Object.values(cards).reduce((sum, arr) => sum + arr.length, 0);
    const remaining = totalCards - currentTotal;
    if (remaining > 0) {
        for (let i = 0; i < remaining; i++) {
            cards[lists[0].id].push(generateCard(lists[0].id));
        }
        console.log(`  ✅ Added ${remaining} remaining cards to "${lists[0].name}"`);
    }

    const boardState = {
        lists,
        cards,
        version: 1,
        lastModifiedAt: Date.now()
    };

    return boardState;
}

/**
 * Save data to localStorage
 */
function saveToLocalStorage(data) {
    try {
        localStorage.setItem('kanban-board', JSON.stringify(data));
        console.log('✅ Successfully saved data to localStorage');
        return true;
    } catch (error) {
        console.error('❌ Failed to save to localStorage:', error);
        return false;
    }
}

/**
 * Main execution function
 */
function seedDatabase(numCards = 500) {
    console.log('🚀 Starting data seeding process...\n');

    const data = generateSeedData(numCards);
    const totalCards = Object.values(data.cards).reduce((sum, arr) => sum + arr.length, 0);

    console.log('\n📊 Seed Data Summary:');
    console.log(`  - Total Lists: ${data.lists.length}`);
    console.log(`  - Total Cards: ${totalCards}`);
    console.log(`  - Data Size: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`);

    if (typeof localStorage !== 'undefined') {
        saveToLocalStorage(data);
        console.log('\n✨ Seeding complete! Refresh your browser to see the data.\n');
    } else {
        console.log('\n💾 Generated data (copy to browser console to save):');
        console.log(`localStorage.setItem('kanban-board', '${JSON.stringify(data)}');`);
    }

    return data;
}

// Browser environment
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    window.seedKanbanData = seedDatabase;
    console.log('📦 Seeding function available as: window.seedKanbanData(numCards)');
    console.log('💡 Example: window.seedKanbanData(500)');
}

// Node environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { seedDatabase, generateSeedData };
}

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location) {
    // Only auto-run if specific query parameter is present
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('seed')) {
        const numCards = parseInt(urlParams.get('seed')) || 500;
        seedDatabase(numCards);
    }
}

export { seedDatabase, generateSeedData };