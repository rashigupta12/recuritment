// // components/todos/TodosManagement.tsx (updated)
// 'use client';
// import { useRouter } from "next/navigation";

// import { useAuth } from "@/contexts/AuthContext";
// import { frappeAPI } from "@/lib/api/frappeClient";
// import { useEffect, useState } from "react";
// // import { TodosTable } from "@/components/todos/TodosTable";
// import { TodoDetailModal } from "./TodoDetailModal";
// import { LoadingState } from "./LoadingState";
// import { TodosHeader } from "./Header";
// import { TodosTable } from "./TodosTable";

// interface ToDo {
//   name: string;
//   status?: string;
//   priority?: string;
//   date?: string;
//   allocated_to?: string;
//   description?: string;
//   reference_type?: string;
//   reference_name?: string;
//   custom_job_id?: string;
//   assigned_by?: string;
//   assigned_by_full_name?: string;
//   creation?: string;
//   modified?: string;
//   doctype?: string;
// }

// // interface ApiResponse {
// //   data: ToDo[];
// // }

// // interface ToDoDetailResponse {
// //   data: ToDo;
// // }

// const TodosManagement = () => {
//   const [todos, setTodos] = useState<ToDo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedTodo, setSelectedTodo] = useState<ToDo | null>(null);
//   const [showModal, setShowModal] = useState(false);
//   const { user } = useAuth();
// const router = useRouter();

//   // Function to fetch todos
//   const fetchTodos = async (email: string) => {
//     try {
//       setLoading(true);
//       const response = await frappeAPI.getAllTodos(email);
//       const todoList = response.data || [];

//       const detailedTodos = await Promise.all(
//         todoList.map(async (todo: { name: string }) => {
//           try {
//             const todoDetails = await frappeAPI.getTodoBYId(todo.name);
//             return todoDetails.data;
//           } catch (err) {
//             console.error(`Error fetching details for ${todo.name}:`, err);
//             return null;
//           }
//         })
//       );

//       setTodos(detailedTodos.filter(Boolean));
//     } catch (error) {
//       console.error("Error fetching todos:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!user) return;
//     fetchTodos(user.email);
//   }, [user]);

//   // Filter todos based on search query
//   const filteredTodos = todos.filter((todo) => {
//     if (!searchQuery) return true;
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       (todo.description || "").toLowerCase().includes(searchLower) ||
//       (todo.reference_type || "").toLowerCase().includes(searchLower) ||
//       (todo.reference_name || "").toLowerCase().includes(searchLower) ||
//       (todo.custom_job_id || "").toLowerCase().includes(searchLower) ||
//       (todo.status || "").toLowerCase().includes(searchLower) ||
//       (todo.priority || "").toLowerCase().includes(searchLower)
//     );
//   });

//   // Event handlers
//  const handleViewTodo = (todo: any) => {
//   router.push(`/dashboard/recruiter/todos/${todo.name}`);
// };

//   const handleEditTodo = (todo: ToDo) => {
//     setSelectedTodo(todo);
//     // You can implement edit functionality here
//     console.log('Edit todo:', todo);
//     // router.push(`/todos/${todo.name}/edit`); // If you have edit page
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setSelectedTodo(null);
//   };

//   const handleRefresh = () => {
//     if (user) {
//       fetchTodos(user.email);
//     }
//   };

//   // Render loading state
//   if (loading) {
//     return <LoadingState />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <TodosHeader
//         searchQuery={searchQuery}
//         onSearchChange={setSearchQuery}
//         onRefresh={handleRefresh}
//       />

//       {/* <TodosStats todos={todos} /> */}

//       <div className="w-full mx-auto py-2">
//         {filteredTodos.length > 0 ? (
//           <TodosTable
//             todos={filteredTodos}
//             onViewTodo={handleViewTodo}
//             onEditTodo={handleEditTodo}
//           />
//         ) : (
//           <div className="text-center py-8">
//             <div className="text-gray-500 text-lg">
//               {searchQuery ? "No tasks found matching your search." : "No tasks assigned to you."}
//             </div>
//             <button
//               onClick={handleRefresh}
//               className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Refresh
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Todo Detail Modal */}
//       {showModal && (
//         <TodoDetailModal 
//           todoId={selectedTodo} 
//           onClose={handleCloseModal} 
//         />
//       )}
//     </div>
//   );
// };

// export default TodosManagement;



// components/todos/TodosManagement.tsx (updated)
'use client';
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { useEffect, useState } from "react";
import { LoadingState } from "./LoadingState";
import { TodosHeader } from "./Header";
import { TodosTable } from "./TodosTable";

interface ToDo {
  name: string;
  status?: string;
  priority?: string;
  date?: string;
  allocated_to?: string;
  description?: string;
  reference_type?: string;
  reference_name?: string;
  custom_job_id?: string;
  assigned_by?: string;
  assigned_by_full_name?: string;
  creation?: string;
  modified?: string;
  doctype?: string;
}

const TodosManagement = () => {
  const [todos, setTodos] = useState<ToDo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  // Function to fetch todos
  const fetchTodos = async (email: string) => {
    try {
      setLoading(true);
      const response = await frappeAPI.getAllTodos(email);
      const todoList = response.data || [];

      const detailedTodos = await Promise.all(
        todoList.map(async (todo: { name: string }) => {
          try {
            const todoDetails = await frappeAPI.getTodoBYId(todo.name);
            return todoDetails.data;
          } catch (err) {
            console.error(`Error fetching details for ${todo.name}:`, err);
            return null;
          }
        })
      );

      setTodos(detailedTodos.filter(Boolean));
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchTodos(user.email);
  }, [user]);

  // Filter todos based on search query
  const filteredTodos = todos.filter((todo) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      (todo.description || "").toLowerCase().includes(searchLower) ||
      (todo.reference_type || "").toLowerCase().includes(searchLower) ||
      (todo.reference_name || "").toLowerCase().includes(searchLower) ||
      (todo.custom_job_id || "").toLowerCase().includes(searchLower) ||
      (todo.status || "").toLowerCase().includes(searchLower) ||
      (todo.priority || "").toLowerCase().includes(searchLower)
    );
  });

  // Event handlers
  const handleViewTodo = (todo: ToDo) => {
    router.push(`/dashboard/recruiter/todos/${todo.name}`);
  };

  const handleEditTodo = (todo: ToDo) => {
    // You can implement edit functionality here
    console.log('Edit todo:', todo);
    // router.push(`/todos/${todo.name}/edit`); // If you have edit page
  };

  const handleRefresh = () => {
    if (user) {
      fetchTodos(user.email);
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TodosHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
      />

      <div className="w-full mx-auto py-2">
        {filteredTodos.length > 0 ? (
          <TodosTable
            todos={filteredTodos}
            onViewTodo={handleViewTodo}
            onEditTodo={handleEditTodo}
          />
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">
              {searchQuery ? "No tasks found matching your search." : "No tasks assigned to you."}
            </div>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* ✅ Modal related code COMPLETELY REMOVED */}
    </div>
  );
};

export default TodosManagement;