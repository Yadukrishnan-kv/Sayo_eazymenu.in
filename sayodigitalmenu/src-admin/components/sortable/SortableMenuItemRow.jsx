import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, UtensilsCrossed } from 'lucide-react';

export function SortableMenuItemRow({ item, getMainSectionName, getClassificationName, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-sayo-borderSubtle hover:bg-sayo-surfaceHover/50 last:border-b-0 ${
        item.isActive === false ? 'opacity-60' : ''
      } ${isDragging ? 'bg-sayo-surfaceHover' : ''}`}
    >
      <td className="py-4 px-4 align-middle">
        <button
          type="button"
          className="p-1.5 rounded-full text-sayo-muted hover:text-sayo-accent cursor-grab active:cursor-grabbing touch-none"
          aria-label={`Reorder ${item.name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="py-4 px-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-sayo-surface border border-sayo-borderSubtle shrink-0 flex items-center justify-center">
          {(item.imageUrls?.[0] || item.imageUrl) ? (
            <img src={item.imageUrls?.[0] || item.imageUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <UtensilsCrossed className="w-6 h-6 text-sayo-creamMuted/50" aria-hidden />
          )}
        </div>
      </td>
      <td className="py-4 px-4">
        <p className="font-medium text-sayo-cream">{item.name}</p>
      </td>
      <td className="py-4 px-4 text-sayo-creamMuted">{getMainSectionName(item.mainSectionId)}</td>
      <td className="py-4 px-4 text-sayo-creamMuted">{getClassificationName(item.classificationId)}</td>
      <td className="py-4 px-4 text-sayo-accent">{item.price} SAR</td>
      <td className="py-4 px-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            item.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}
        >
          {item.isActive !== false ? 'On menu' : 'Off menu'}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onEdit} className="btn-ghost p-2" aria-label={`Edit ${item.name}`}>
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="btn-ghost p-2 text-red-400 hover:text-red-300"
            aria-label={`Delete ${item.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

