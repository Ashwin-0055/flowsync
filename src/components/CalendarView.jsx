import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiPlus } from 'react-icons/fi';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';

// Draggable Card Component
const DraggableCalendarCard = ({ card, onClick, getPriorityColor }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: card.id,
        data: { card }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 1000,
        opacity: isDragging ? 0.5 : 1
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            onClick={(e) => {
                e.stopPropagation();
                onClick(card);
            }}
            className={`
                text-xs p-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-lg
                flex items-center gap-2 mb-1.5
                ${getPriorityColor(card.priority)}
            `}
            title={card.title}
        >
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${card.priority === 'High' ? 'bg-red-400' : card.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
            <span className="truncate font-medium">{card.title}</span>
        </div>
    );
};

// Droppable Day Component
const DroppableDay = ({ day, isCurrentMonth, isTodayDate, children, onAddCard }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: day.toISOString(),
        data: { date: day }
    });

    return (
        <div
            ref={setNodeRef}
            onClick={() => onAddCard && onAddCard(day)}
            className={`
                min-h-[120px] p-3 border-b border-r border-slate-700/50 transition-colors relative group cursor-pointer
                ${!isCurrentMonth ? 'bg-slate-900/40 text-slate-600' : 'bg-transparent text-slate-200 hover:bg-slate-700/30'}
                ${isTodayDate ? 'bg-primary-500/10' : ''}
                ${isOver ? 'bg-primary-500/20 ring-2 ring-inset ring-primary-500' : ''}
            `}
        >
            {children}

            {/* Add Card Hint */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1.5 bg-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-primary-500 transition-colors">
                    <FiPlus className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
};

const CalendarView = ({ cards, onCardClick, onAddCard, onCardMove }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeDragCard, setActiveDragCard] = useState(null);

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-500/20 text-red-100 border-red-500/40 hover:bg-red-500/30';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/40 hover:bg-yellow-500/30';
            case 'Low': return 'bg-green-500/20 text-green-100 border-green-500/40 hover:bg-green-500/30';
            default: return 'bg-slate-600/30 text-slate-200 border-slate-500/40 hover:bg-slate-600/40';
        }
    };

    const handleDragStart = (event) => {
        setActiveDragCard(event.active.data.current?.card);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const card = active.data.current?.card;
            const newDate = over.data.current?.date;

            if (card && newDate && onCardMove) {
                onCardMove(card, newDate);
            }
        }
        setActiveDragCard(null);
    };

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 h-full flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary-500/20 rounded-xl border border-primary-500/30 shadow-lg shadow-primary-500/10">
                            <FiCalendar className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                                {format(currentDate, 'MMMM yyyy')}
                            </h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">
                                Manage your schedule and deadlines
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700 backdrop-blur-md shadow-inner">
                        <button
                            onClick={prevMonth}
                            className="p-2.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all active:scale-95"
                            title="Previous Month"
                        >
                            <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 text-sm font-bold text-slate-200 hover:text-white transition-colors border-x border-slate-700 mx-1"
                        >
                            Today
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2.5 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-all active:scale-95"
                            title="Next Month"
                        >
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 flex flex-col min-h-[600px] bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden shadow-inner">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-700/50 bg-slate-800/80">
                        {weekDays.map(day => (
                            <div key={day} className="text-center text-slate-300 text-xs font-bold uppercase tracking-wider py-4">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 flex-1">
                        {calendarDays.map((day, dayIdx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isToday(day);

                            // Filter cards for this day
                            const dayCards = cards.filter(card => {
                                if (!card.dueDate) return false;
                                const cardDate = typeof card.dueDate === 'string' ? parseISO(card.dueDate) : card.dueDate.toDate();
                                return isSameDay(cardDate, day);
                            });

                            return (
                                <DroppableDay
                                    key={day.toString()}
                                    day={day}
                                    isCurrentMonth={isCurrentMonth}
                                    isTodayDate={isTodayDate}
                                    onAddCard={onAddCard}
                                >
                                    {/* Date Number */}
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`
                                            text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all
                                            ${isTodayDate
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/40 scale-110'
                                                : 'text-slate-400 group-hover:text-white group-hover:bg-slate-700'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayCards.length > 0 && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600 shadow-sm">
                                                {dayCards.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Cards List */}
                                    <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar pr-1">
                                        {dayCards.map(card => (
                                            <DraggableCalendarCard
                                                key={card.id}
                                                card={card}
                                                onClick={onCardClick}
                                                getPriorityColor={getPriorityColor}
                                            />
                                        ))}
                                    </div>
                                </DroppableDay>
                            );
                        })}
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeDragCard ? (
                    <div className={`
                        text-xs p-2 rounded-lg border shadow-2xl
                        flex items-center gap-2 mb-1.5 w-[150px]
                        ${getPriorityColor(activeDragCard.priority)}
                    `}>
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeDragCard.priority === 'High' ? 'bg-red-400' : activeDragCard.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                        <span className="truncate font-medium">{activeDragCard.title}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CalendarView;
