import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil } from 'lucide-react';

export function SortableMainSectionCard({ section, Icon, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 py-4 px-4 rounded-lg border border-sayo-borderSubtle hover:bg-sayo-surface/50 transition-colors group ${
        isDragging ? 'opacity-60 bg-sayo-surfaceHover' : ''
      }`}
    >
      <button
        type="button"
        className="p-2 rounded-full text-sayo-muted hover:text-sayo-accent cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${section.name}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="p-3 rounded-lg bg-[rgba(212,165,116,0.12)] text-sayo-accent">
        <Icon className="w-8 h-8" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sayo-cream">{section.name}</p>
        <p className="text-sm text-sayo-creamMuted">{section.slug}</p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onEdit} className="btn-ghost p-2" aria-label={`Edit ${section.name}`}>
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="btn-ghost p-2 text-red-400 hover:text-red-300"
          aria-label={`Delete ${section.name}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

