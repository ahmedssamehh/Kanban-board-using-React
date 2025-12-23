// Three-way merge utilities for conflict resolution

/**
 * Performs three-way merge between base, local, and server versions
 * @param {Object} base - Original version
 * @param {Object} local - Local modified version
 * @param {Object} server - Server version
 * @returns {Object} - { merged, conflicts }
 */
export function threeWayMerge(base, local, server) {
  // If versions match, no conflict
  if (local.version === server.version) {
    return { merged: local, conflicts: [] };
  }

  // If server is older, keep local
  if (server.version < local.version) {
    return { merged: local, conflicts: [] };
  }

  const conflicts = [];
  const merged = { ...server };

  // Check each field for conflicts
  const fields = ['title', 'description', 'tags', 'archived', 'order'];
  
  fields.forEach((field) => {
    const baseValue = base?.[field];
    const localValue = local[field];
    const serverValue = server[field];

    // If local changed but server also changed differently
    if (
      JSON.stringify(localValue) !== JSON.stringify(baseValue) &&
      JSON.stringify(serverValue) !== JSON.stringify(baseValue) &&
      JSON.stringify(localValue) !== JSON.stringify(serverValue)
    ) {
      conflicts.push({
        field,
        base: baseValue,
        local: localValue,
        server: serverValue,
      });
    } else if (JSON.stringify(localValue) !== JSON.stringify(baseValue)) {
      // Local changed, server didn't - use local
      merged[field] = localValue;
    }
    // Otherwise use server value (already set)
  });

  return { merged, conflicts };
}

/**
 * Merges entire board state
 */
export function mergeBoardState(baseState, localState, serverState) {
  const conflicts = [];
  const mergedLists = [];
  const mergedCards = {};

  // Merge lists
  const allListIds = new Set([
    ...localState.lists.map((l) => l.id),
    ...serverState.lists.map((l) => l.id),
  ]);

  allListIds.forEach((listId) => {
    const baseList = baseState?.lists?.find((l) => l.id === listId);
    const localList = localState.lists.find((l) => l.id === listId);
    const serverList = serverState.lists.find((l) => l.id === listId);

    if (!localList && serverList) {
      // Deleted locally but exists on server - keep deletion
      return;
    }

    if (localList && !serverList) {
      // Added locally or deleted on server
      if (!baseList) {
        // Added locally, keep it
        mergedLists.push(localList);
      }
      // Deleted on server, respect deletion
      return;
    }

    if (localList && serverList) {
      const { merged, conflicts: listConflicts } = threeWayMerge(
        baseList,
        localList,
        serverList
      );

      if (listConflicts.length > 0) {
        conflicts.push({
          type: 'list',
          id: listId,
          conflicts: listConflicts,
          local: localList,
          server: serverList,
        });
        // Use server version for now, will be resolved in UI
        mergedLists.push(serverList);
      } else {
        mergedLists.push(merged);
      }
    }
  });

  // Merge cards
  allListIds.forEach((listId) => {
    const localCards = localState.cards[listId] || [];
    const serverCards = serverState.cards[listId] || [];
    const baseCards = baseState?.cards?.[listId] || [];

    const allCardIds = new Set([
      ...localCards.map((c) => c.id),
      ...serverCards.map((c) => c.id),
    ]);

    mergedCards[listId] = [];

    allCardIds.forEach((cardId) => {
      const baseCard = baseCards.find((c) => c.id === cardId);
      const localCard = localCards.find((c) => c.id === cardId);
      const serverCard = serverCards.find((c) => c.id === cardId);

      if (!localCard && serverCard) {
        // Deleted locally
        return;
      }

      if (localCard && !serverCard) {
        // Added locally or deleted on server
        if (!baseCard) {
          mergedCards[listId].push(localCard);
        }
        return;
      }

      if (localCard && serverCard) {
        const { merged, conflicts: cardConflicts } = threeWayMerge(
          baseCard,
          localCard,
          serverCard
        );

        if (cardConflicts.length > 0) {
          conflicts.push({
            type: 'card',
            listId,
            id: cardId,
            conflicts: cardConflicts,
            local: localCard,
            server: serverCard,
          });
          mergedCards[listId].push(serverCard);
        } else {
          mergedCards[listId].push(merged);
        }
      }
    });
  });

  return {
    merged: {
      lists: mergedLists,
      cards: mergedCards,
      boardTitle: serverState.boardTitle || localState.boardTitle,
      lastModified: Date.now(),
    },
    conflicts,
  };
}
