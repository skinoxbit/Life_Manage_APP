import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Tag, StickyNote, CheckSquare, Square, X, Link, Maximize2, Minimize2 } from 'lucide-react';
import { useData, Note, TodoItem } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';

const noteColors = [
  'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700',
  'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
  'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700',
  'bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700',
  'bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700',
  'bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700',
];

const categories = ['Personal', 'Work', 'Ideas', 'Shopping', 'Health', 'Travel'];

export const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote } = useData();
  const { theme, themes } = useTheme();
  const currentTheme = themes[theme];

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [draggedNote, setDraggedNote] = useState<string | null>(null);
  const [resizingNote, setResizingNote] = useState<string | null>(null);
  const [noteSizes, setNoteSizes] = useState<Record<string, 'small' | 'medium' | 'large'>>({});
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'Personal',
    color: noteColors[0],
    type: 'note' as 'note' | 'todo',
    todos: [] as TodoItem[]
  });

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddNote = () => {
    if (newNote.title.trim()) {
      addNote(newNote);
      setNewNote({ 
        title: '', 
        content: '', 
        category: 'Personal', 
        color: noteColors[0], 
        type: 'note',
        todos: []
      });
      setIsAddingNote(false);
    }
  };

  const handleUpdateNote = () => {
    if (editingNote && editingNote.title.trim()) {
      updateNote(editingNote.id, editingNote);
      setEditingNote(null);
    }
  };

  const addTodoToNote = (noteId: string, todoText: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: todoText,
      completed: false,
      createdAt: new Date()
    };

    const updatedTodos = [...(note.todos || []), newTodo];
    updateNote(noteId, { todos: updatedTodos });
  };

  const toggleTodo = (noteId: string, todoId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.todos) return;

    const updatedTodos = note.todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    updateNote(noteId, { todos: updatedTodos });
  };

  const deleteTodo = (noteId: string, todoId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.todos) return;

    const updatedTodos = note.todos.filter(todo => todo.id !== todoId);
    updateNote(noteId, { todos: updatedTodos });
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(id);
    }
  };

  const handleDragStart = (e: React.DragEvent, noteId: string) => {
    setDraggedNote(noteId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetNoteId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedNote || draggedNote === targetNoteId) return;

    const draggedIndex = filteredNotes.findIndex(n => n.id === draggedNote);
    const targetIndex = filteredNotes.findIndex(n => n.id === targetNoteId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder the notes array
    const reorderedNotes = [...notes];
    const draggedNoteObj = reorderedNotes.find(n => n.id === draggedNote);
    const targetNoteObj = reorderedNotes.find(n => n.id === targetNoteId);
    
    if (draggedNoteObj && targetNoteObj) {
      const draggedOriginalIndex = reorderedNotes.findIndex(n => n.id === draggedNote);
      const targetOriginalIndex = reorderedNotes.findIndex(n => n.id === targetNoteId);
      
      reorderedNotes.splice(draggedOriginalIndex, 1);
      reorderedNotes.splice(targetOriginalIndex, 0, draggedNoteObj);
      
      // Update all notes with new order
      reorderedNotes.forEach((note, index) => {
        updateNote(note.id, { ...note });
      });
    }

    setDraggedNote(null);
  };

  const toggleNoteSize = (noteId: string) => {
    const currentSize = noteSizes[noteId] || 'medium';
    const nextSize = currentSize === 'small' ? 'medium' : currentSize === 'medium' ? 'large' : 'small';
    setNoteSizes(prev => ({ ...prev, [noteId]: nextSize }));
  };

  const getSizeClasses = (noteId: string) => {
    const size = noteSizes[noteId] || 'medium';
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'large': return 'col-span-2 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  const addHyperlinkToNote = (noteId: string, url: string, text: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const hyperlink = `[${text}](${url})`;
    const updatedContent = note.content + (note.content ? '\n' : '') + hyperlink;
    updateNote(noteId, { content: updatedContent });
  };

  const renderContentWithLinks = (content: string) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          onClick={(e) => e.stopPropagation()}
        >
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <div className={`p-6 ${currentTheme.background} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${currentTheme.text} mb-2`}>Notes</h1>
            <p className={`${currentTheme.text} opacity-70`}>
              Organize your thoughts and ideas
            </p>
          </div>
          <button
            onClick={() => setIsAddingNote(true)}
            className={`mt-4 sm:mt-0 ${currentTheme.primary} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center hover:scale-105`}
          >
            <Plus size={20} className="mr-2" />
            Add Note
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${currentTheme.text} opacity-50`} size={20} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max">
          {/* Add Note Card */}
          {isAddingNote && (
            <div className={`${currentTheme.surface} p-4 rounded-lg shadow-lg border-2 border-dashed border-gray-300 dark:border-gray-600 col-span-1`}>
              <input
                type="text"
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className={`w-full mb-3 px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                autoFocus
              />
              <textarea
                placeholder="Write your note..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className={`w-full mb-3 px-3 py-2 h-32 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${currentTheme.text}`}
              />
              <div className="flex justify-between items-center mb-3">
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className={`px-3 py-1 text-sm ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded ${currentTheme.text}`}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value as 'note' | 'todo' })}
                  className={`px-3 py-1 text-sm ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded ${currentTheme.text}`}
                >
                  <option value="note">Note</option>
                  <option value="todo">TODO List</option>
                </select>
              </div>
              <div className="flex gap-2 mb-3">
                {noteColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setNewNote({ ...newNote, color })}
                    className={`w-6 h-6 rounded-full border-2 ${color} ${newNote.color === color ? 'ring-2 ring-blue-500' : ''}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className={`flex-1 ${currentTheme.primary} text-white py-2 rounded hover:shadow-lg transition-all duration-200`}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsAddingNote(false)}
                  className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} py-2 rounded hover:shadow-lg transition-all duration-200`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Existing Notes */}
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              draggable
              onDragStart={(e) => handleDragStart(e, note.id)}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, note.id)}
              onDoubleClick={() => setEditingNote(note)}
              className={`${note.color} p-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:scale-105 drag-target ${getSizeClasses(note.id)}`}
            >
              {editingNote?.id === note.id ? (
                <div>
                  <input
                    type="text"
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                    className={`w-full mb-3 px-3 py-2 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text}`}
                  />
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className={`w-full mb-3 px-3 py-2 h-32 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${currentTheme.text}`}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateNote}
                      className={`flex-1 ${currentTheme.primary} text-white py-2 rounded hover:shadow-lg transition-all duration-200`}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className={`flex-1 ${currentTheme.secondary} ${currentTheme.text} py-2 rounded hover:shadow-lg transition-all duration-200`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {note.type === 'todo' && <CheckSquare size={16} className={currentTheme.text} />}
                      {note.type === 'note' && <StickyNote size={16} className={currentTheme.text} />}
                      <h3 className={`font-semibold ${currentTheme.text} text-lg`}>
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNoteSize(note.id);
                        }}
                        className={`p-1 rounded hover:${currentTheme.secondary} transition-colors ${currentTheme.text}`}
                      >
                        {(noteSizes[note.id] || 'medium') === 'large' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNote(note);
                        }}
                        className={`p-1 rounded hover:${currentTheme.secondary} transition-colors ${currentTheme.text}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className={`p-1 rounded hover:bg-red-100 transition-colors text-red-600`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {note.type === 'note' ? (
                    <p className={`${currentTheme.text} opacity-80 text-sm mb-3 line-clamp-4`}>
                      {renderContentWithLinks(note.content)}
                    </p>
                  ) : (
                    <div className="mb-3">
                      {note.todos && note.todos.length > 0 ? (
                        <ul className="space-y-2">
                          {note.todos.slice(0, 3).map((todo) => (
                            <li key={todo.id} className="flex items-center gap-3 group">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTodo(note.id, todo.id);
                                }}
                                className={`flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                                  todo.completed ? 'text-green-600' : `${currentTheme.text} opacity-60 hover:opacity-100`
                                }`}
                              >
                                {todo.completed ? <CheckSquare size={16} /> : <Square size={16} />}
                              </button>
                              <span className={`text-sm flex-1 transition-all duration-300 ${
                                todo.completed 
                                  ? 'line-through opacity-50 text-gray-500' 
                                  : `${currentTheme.text}`
                              }`}>
                                {todo.text}
                              </span>
                            </li>
                          ))}
                          {note.todos.length > 3 && (
                            <li className={`text-xs ${currentTheme.text} opacity-60 italic pl-5`}>
                              +{note.todos.length - 3} more items
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className={`text-sm ${currentTheme.text} opacity-60`}>No todos yet</p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentTheme.accent} text-white`}>
                      <Tag size={12} className="mr-1" />
                      {note.category}
                    </span>
                    <span className={`text-xs ${currentTheme.text} opacity-60`}>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && !isAddingNote && (
          <div className={`text-center py-12 ${currentTheme.text} opacity-70`}>
            <StickyNote size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No notes found</p>
            <p className="text-sm">Click "Add Note" to create your first note</p>
          </div>
        )}
      </div>

      {/* TODO Detail Modal */}
      {editingNote && editingNote.type === 'todo' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${currentTheme.surface} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <>
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className={`text-2xl font-bold ${currentTheme.text}`}>{editingNote.title}</h2>
                  <button
                    onClick={() => setEditingNote(null)}
                    className={`${currentTheme.text} opacity-50 hover:opacity-100 transition-opacity`}
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {editingNote.todos?.map((todo) => (
                    <div key={todo.id} className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      todo.completed 
                        ? `${currentTheme.secondary} border-green-200 dark:border-green-800` 
                        : `${currentTheme.surface} border-gray-200 dark:border-gray-600 hover:border-blue-300`
                    }`}>
                      <button
                        onClick={() => toggleTodo(editingNote.id, todo.id)}
                        className={`flex-shrink-0 transition-all duration-200 hover:scale-110 ${
                          todo.completed ? 'text-green-600' : `${currentTheme.text} opacity-60 hover:opacity-100`
                        }`}
                      >
                        {todo.completed ? <CheckSquare size={22} /> : <Square size={22} />}
                      </button>
                      <span className={`flex-1 transition-all duration-300 ${
                        todo.completed 
                          ? 'line-through opacity-50 text-gray-500' 
                          : `${currentTheme.text}`
                      }`}>
                        {todo.text}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        todo.completed 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                      <button
                        onClick={() => deleteTodo(editingNote.id, todo.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-3 mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <input
                      type="text"
                      placeholder="Add new todo item..."
                      className={`flex-1 px-4 py-3 ${currentTheme.surface} border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${currentTheme.text} placeholder-gray-400`}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          addTodoToNote(editingNote.id, e.currentTarget.value.trim());
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        if (input.value.trim()) {
                          addTodoToNote(editingNote.id, input.value.trim());
                          input.value = '';
                        }
                      }}
                      className={`${currentTheme.primary} text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium`}
                    >
                      <Plus size={20} />
                      Add Todo
                    </button>
                  </div>

                  {editingNote.type === 'note' && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = prompt('Enter URL:');
                          const text = prompt('Enter link text:') || 'Link';
                          if (url) {
                            addHyperlinkToNote(editingNote.id, url, text);
                          }
                        }}
                        className={`${currentTheme.primary} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200`}
                      >
                        <Link size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          </div>
        </div>
      )}
    </div>
  );
};