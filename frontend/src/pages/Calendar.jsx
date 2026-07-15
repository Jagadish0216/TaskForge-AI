import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarService, taskService } from '../services/services';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [weekRes, allTasksRes] = await Promise.all([
        calendarService.getWeeklyTasks().catch(() => null),
        taskService.getTasks().catch(() => null),
      ]);

      const rawTaskData = allTasksRes?.data ?? allTasksRes;
      const tList = rawTaskData?.content ?? (Array.isArray(rawTaskData) ? rawTaskData : []);
      setTasks(Array.isArray(tList) ? tList : []);
    } catch (err) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" /> Calendar & Milestone Schedules
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualize upcoming project deadlines and task deliverables
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm font-mono">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="bg-slate-100 dark:bg-slate-900/90 p-2.5 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
              {d}
            </div>
          ))}

          {/* Blank padding for previous month */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`blank-${idx}`} className="bg-slate-50/50 dark:bg-slate-950/40 min-h-[95px] p-2" />
          ))}

          {/* Month Days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            
            const dayTasks = safeTasks.filter((t) => t && t.dueDate && t.dueDate.startsWith(formattedDate));

            return (
              <div
                key={dayNum}
                className="bg-white dark:bg-slate-900 min-h-[95px] p-2 flex flex-col justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors border-t border-slate-100 dark:border-slate-800/60"
              >
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dayNum}</span>

                <div className="space-y-1 overflow-y-auto max-h-16 scrollbar-none">
                  {dayTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => navigate(`/tasks/${t.id}`)}
                      className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg text-[10px] truncate font-semibold cursor-pointer hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors shadow-2xs"
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default CalendarPage;
