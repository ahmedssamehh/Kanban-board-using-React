import { useState, useEffect, useRef } from 'react';
import { useBoardState } from '../hooks/useBoardState';
import { validateCardTitle, validateTag } from '../utils/validators';

function CardDetailModal({ card, listId, onClose }) {
  const { dispatch, ACTIONS } = useBoardState();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [tags, setTags] = useState(card.tags || []);
  const [newTag, setNewTag] = useState('');
  const modalRef = useRef(null);

  useEffect(() => {
    // Focus trap
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    const validation = validateCardTitle(title);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    dispatch({
      type: ACTIONS.UPDATE_CARD,
      payload: {
        listId,
        cardId: card.id,
        updates: { title, description, tags },
      },
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this card?')) {
      dispatch({
        type: ACTIONS.DELETE_CARD,
        payload: { listId, cardId: card.id },
      });
      onClose();
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;

    const validation = validateTag(newTag);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (tags.includes(newTag.trim())) {
      alert('Tag already exists');
      return;
    }

    setTags([...tags, newTag.trim()]);
    setNewTag('');
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <button
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      aria-label="Close dialog"
      type="button"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
        role="document"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
              Edit Card
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label
              htmlFor="card-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title
            </label>
            <input
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="card-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="card-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label
              htmlFor="card-tags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                id="card-tags"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tags.indexOf(tag))}
                    className="text-blue-700 hover:text-blue-900 font-bold"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete Card
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default CardDetailModal;
