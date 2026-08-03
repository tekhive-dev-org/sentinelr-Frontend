import { useState } from 'react';
import SectionCard from '../users/SectionCard';
import NotesIcon from '@mui/icons-material/Notes';
import styles from './AlertNotes.module.css';

export default function AlertNotes({
  notes,
  isLoading,
  onAddNote,
  isAddingNote,
}) {
  const [newNote, setNewNote] = useState('');
  const isEmpty = !notes || notes.length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (!trimmed) return;
    onAddNote?.(trimmed);
    setNewNote('');
  };

  return (
    <SectionCard
      title="Admin Notes"
      icon={NotesIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No notes. Add one above."
    >
      <div className={styles.content}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Add an internal note…"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            disabled={isAddingNote}
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isAddingNote || !newNote.trim()}
          >
            {isAddingNote ? 'Saving…' : 'Submit'}
          </button>
        </form>

        {!isEmpty && (
          <ul className={styles.noteList}>
            {notes.map((note) => (
              <li key={note.id} className={styles.noteRow}>
                <div className={styles.noteHeader}>
                  <span className={styles.noteAuthor}>{note.author}</span>
                  <time className={styles.noteTime}>
                    {new Date(note.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
                <p className={styles.noteContent}>{note.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  );
}
