import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';

export function SortableClassificationRow({ classification, mainSectionName, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: classification.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 py-4 px-2 -mx-2 rounded-lg hover:bg-sayo-surfaceHover group ${
        isDragging ? 'opacity-50 bg-sayo-surfaceHover' : ''
      }`}
    >
      <button
        type="button"
        className="p-2 rounded-full text-sayo-muted hover:text-sayo-accent cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${classification.name}`}
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sayo-cream">{classification.name}</p>
        {mainSectionName && (
          <p className="text-sm text-sayo-creamMuted">{mainSectionName}</p>
        )}
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button type="button" onClick={onEdit} className="btn-ghost p-2" aria-label={`Edit ${classification.name}`}>
          <Pencil className="w-4 h-4" />
        </button>
        <button type="button" onClick={onDelete} className="btn-ghost p-2 text-red-400 hover:text-red-300" aria-label={`Delete ${classification.name}`}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}
