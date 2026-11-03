import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare } from 'lucide-react';

export const TaskCard = ({ task, onClick }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: 'Task',
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    const priority = task.position % 3 === 0 ? 'High' : task.position % 2 === 0 ? 'Medium' : 'Low';
    const priorityBadge =
        priority === 'High'
            ? 'bg-rose-50 text-rose-600 border-rose-200'
            : priority === 'Medium'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200';

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(task)}
            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing select-none group"
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadge}`}>
                    {priority}
                </span>
                <span
                    title="Optimistic Concurrency Version"
                    className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded"
                >
                    v{task.version}
                </span>
            </div>

            <h4 className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                {task.title}
            </h4>

            {task.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                </p>
            )}

            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
                <div className="flex items-center space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                        {task.assignee?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium truncate max-w-[90px]">
                        {task.assignee?.name || 'Unassigned'}
                    </span>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span className="flex items-center space-x-0.5">
                        <MessageSquare className="w-3 h-3" />
                        <span>{task.version * 2}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;