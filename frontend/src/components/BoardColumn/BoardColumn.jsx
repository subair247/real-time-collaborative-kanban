import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from '../TaskCard/TaskCard';
import { Plus } from 'lucide-react';

export const BoardColumn = ({ column, tasks, onTaskClick, onAddTask }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    const getHeaderAccent = (name) => {
        switch (name) {
            case 'To Do':
                return { dot: 'bg-indigo-500', bar: 'border-t-indigo-500' };
            case 'In Progress':
                return { dot: 'bg-amber-500', bar: 'border-t-amber-500' };
            case 'Testing':
                return { dot: 'bg-purple-500', bar: 'border-t-purple-500' };
            case 'Done':
                return { dot: 'bg-emerald-500', bar: 'border-t-emerald-500' };
            default:
                return { dot: 'bg-slate-400', bar: 'border-t-slate-400' };
        }
    };

    const accent = getHeaderAccent(column.name);

    return (
        <div
            ref={setNodeRef}
            className={`w-80 flex-shrink-0 bg-slate-100/70 rounded-2xl p-3 flex flex-col max-h-[calc(100vh-10rem)] border border-slate-200/80 border-t-4 ${accent.bar}`}
        >
            <div className="flex items-center justify-between pb-2 px-1">
                <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${accent.dot}`}></span>
                    <h3 className="text-sm font-bold text-slate-800">{column.name}</h3>
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>

                <button
                    onClick={() => onAddTask(column.id)}
                    title="Add new task"
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
                <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400 font-medium">
                        Drop tasks here
                    </div>
                )}
            </div>

            <button
                onClick={() => onAddTask(column.id)}
                className="mt-2 w-full py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
            >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
            </button>
        </div>
    );
};

export default BoardColumn;