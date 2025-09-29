// components/todos/Stats.tsx
interface ToDo {
  status?: string;
  priority?: string;
}

interface TodosStatsProps {
  todos: ToDo[];
}

export const TodosStats = ({ todos }: TodosStatsProps) => {
  const totalTasks = todos.length;
  const openTasks = todos.filter(todo => todo.status?.toLowerCase() === 'open').length;
  const highPriorityTasks = todos.filter(todo => todo.priority?.toLowerCase() === 'high').length;
  const completedTasks = todos.filter(todo => todo.status?.toLowerCase() === 'closed').length;

  const stats = [
    { name: 'Total Tasks', value: totalTasks, color: 'bg-blue-500' },
    { name: 'Open Tasks', value: openTasks, color: 'bg-yellow-500' },
    { name: 'High Priority', value: highPriorityTasks, color: 'bg-red-500' },
    { name: 'Completed', value: completedTasks, color: 'bg-green-500' },
  ];

  return (
    <div className="bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};