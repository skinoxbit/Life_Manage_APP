import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  color: string;
  type: 'note' | 'todo';
  todos?: TodoItem[];
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  category: string;
  color: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  purchaseDate: Date;
  purchasePrice: number;
  warrantyExpiry?: Date;
  returnDeadline?: Date;
  receiptImage?: string;
  notes: string;
  location: string;
}

export interface LendingItem {
  id: string;
  itemName: string;
  personName: string;
  type: 'lent' | 'borrowed';
  lentDate: Date;
  returnDate?: Date;
  expectedReturnDate: Date;
  notes: string;
  returned: boolean;
}

interface DataContextType {
  notes: Note[];
  calendarEvents: CalendarEvent[];
  reminders: Reminder[];
  inventory: InventoryItem[];
  lending: LendingItem[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, note: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateCalendarEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addLendingItem: (item: Omit<LendingItem, 'id'>) => void;
  updateLendingItem: (id: string, item: Partial<LendingItem>) => void;
  deleteLendingItem: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lending, setLending] = useState<LendingItem[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const loadData = (key: string, setter: (data: any[]) => void) => {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          const processed = parsed.map((item: any) => ({
            ...item,
            createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
            updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            date: item.date ? new Date(item.date) : undefined,
            dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
            warrantyExpiry: item.warrantyExpiry ? new Date(item.warrantyExpiry) : undefined,
            returnDeadline: item.returnDeadline ? new Date(item.returnDeadline) : undefined,
            lentDate: item.lentDate ? new Date(item.lentDate) : undefined,
            returnDate: item.returnDate ? new Date(item.returnDate) : undefined,
            expectedReturnDate: item.expectedReturnDate ? new Date(item.expectedReturnDate) : undefined,
          }));
          setter(processed);
        } catch (error) {
          console.error(`Error loading ${key}:`, error);
        }
      }
    };

    loadData('productivity-notes', setNotes);
    loadData('productivity-events', setCalendarEvents);
    loadData('productivity-reminders', setReminders);
    loadData('productivity-inventory', setInventory);
    loadData('productivity-lending', setLending);
  }, []);

  // Save data to localStorage
  const saveData = (key: string, data: any[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Notes functions
  const addNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveData('productivity-notes', updatedNotes);
  };

  const updateNote = (id: string, noteData: Partial<Note>) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, ...noteData, updatedAt: new Date() } : note
    );
    setNotes(updatedNotes);
    saveData('productivity-notes', updatedNotes);
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveData('productivity-notes', updatedNotes);
  };

  // Calendar functions
  const addCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    const updatedEvents = [...calendarEvents, newEvent];
    setCalendarEvents(updatedEvents);
    saveData('productivity-events', updatedEvents);
  };

  const updateCalendarEvent = (id: string, eventData: Partial<CalendarEvent>) => {
    const updatedEvents = calendarEvents.map(event =>
      event.id === id ? { ...event, ...eventData } : event
    );
    setCalendarEvents(updatedEvents);
    saveData('productivity-events', updatedEvents);
  };

  const deleteCalendarEvent = (id: string) => {
    const updatedEvents = calendarEvents.filter(event => event.id !== id);
    setCalendarEvents(updatedEvents);
    saveData('productivity-events', updatedEvents);
  };

  // Reminders functions
  const addReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt'>) => {
    const newReminder: Reminder = {
      ...reminderData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updatedReminders = [...reminders, newReminder];
    setReminders(updatedReminders);
    saveData('productivity-reminders', updatedReminders);
  };

  const updateReminder = (id: string, reminderData: Partial<Reminder>) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, ...reminderData } : reminder
    );
    setReminders(updatedReminders);
    saveData('productivity-reminders', updatedReminders);
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = reminders.filter(reminder => reminder.id !== id);
    setReminders(updatedReminders);
    saveData('productivity-reminders', updatedReminders);
  };

  // Inventory functions
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: Date.now().toString(),
    };
    const updatedInventory = [...inventory, newItem];
    setInventory(updatedInventory);
    saveData('productivity-inventory', updatedInventory);
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    const updatedInventory = inventory.map(item =>
      item.id === id ? { ...item, ...itemData } : item
    );
    setInventory(updatedInventory);
    saveData('productivity-inventory', updatedInventory);
  };

  const deleteInventoryItem = (id: string) => {
    const updatedInventory = inventory.filter(item => item.id !== id);
    setInventory(updatedInventory);
    saveData('productivity-inventory', updatedInventory);
  };

  // Lending functions
  const addLendingItem = (itemData: Omit<LendingItem, 'id'>) => {
    const newItem: LendingItem = {
      ...itemData,
      id: Date.now().toString(),
    };
    const updatedLending = [...lending, newItem];
    setLending(updatedLending);
    saveData('productivity-lending', updatedLending);
  };

  const updateLendingItem = (id: string, itemData: Partial<LendingItem>) => {
    const updatedLending = lending.map(item =>
      item.id === id ? { ...item, ...itemData } : item
    );
    setLending(updatedLending);
    saveData('productivity-lending', updatedLending);
  };

  const deleteLendingItem = (id: string) => {
    const updatedLending = lending.filter(item => item.id !== id);
    setLending(updatedLending);
    saveData('productivity-lending', updatedLending);
  };

  return (
    <DataContext.Provider
      value={{
        notes,
        calendarEvents,
        reminders,
        inventory,
        lending,
        addNote,
        updateNote,
        deleteNote,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        addReminder,
        updateReminder,
        deleteReminder,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addLendingItem,
        updateLendingItem,
        deleteLendingItem,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};