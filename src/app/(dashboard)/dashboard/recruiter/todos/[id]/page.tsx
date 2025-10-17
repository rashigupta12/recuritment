"use client";

import ApplicantSearchAndTag from "@/components/recruiter/ApplicantSearchAndTag";
import TaggedApplicants from "@/components/recruiter/TaggedApplicants";
import { TodoDetailModal } from "@/components/recruiter/TodoDetailModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { frappeAPI } from "@/lib/api/frappeClient";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TodoData {
  name: string;
  custom_job_id?: string;
  description?: string;
  owner_email: string;
}

export default function TodoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const todoId = params.id as string;
  const [activeTab, setActiveTab] = useState<
    "details" | "applicants" | "resume"
  >("details");
  const [jobId, setJobId] = useState<string>("");
  const [todoData, setTodoData] = useState<TodoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [jobTiitle, setJobTitle] = useState<string>("");
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState<string>("");
  const userEmail = user?.email;

  const handleClose = () => {
    router.back();
  };

  // const handleFormSubmitSuccess = () => {
  //   console.log("🔄 Refreshing applicants list...");
  //   setIsSheetOpen(false);
  //   setRefreshKey((prev) => prev + 1);
  // };

  // const refreshApplicants = () => {
  //   console.log("🔄 Manual refresh triggered");
  //   setRefreshKey((prev) => prev + 1);
  // };

  // ✅ New function to handle opening sheet from detail modal
  const handleOpenApplicantForm = () => {
    setActiveTab("applicants");
    setIsSheetOpen(true);
  };

  useEffect(() => {
    const fetchTodoDetails = async () => {
      try {
        setLoading(true);
        const todoDetails = await frappeAPI.getTodoBYId(todoId);
        const todo = todoDetails.data;
        console.log(todo);

        setTodoData(todo);
        if (todo.custom_job_id) {
          setJobId(todo.custom_job_id);
          setJobTitle(todo.custom_job_title);
          setCompanyName(todo.custom_company);
        } else {
          console.warn("No job ID found for this todo");
          setJobId("");
        }
      } catch (error) {
        console.error("Error fetching todo details:", error);
        setJobId("");
      } finally {
        setLoading(false);
      }
    };

    if (todoId) {
      fetchTodoDetails();
    }
  }, [todoId]);

  console.log("tododata", todoData);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10">
        <div className="w-full ">
          <div className="flex justify-center space-x-4 ">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-1 rounded-full text-lg font-bold transition ${
                activeTab === "details"
                  ? "bg-blue-100 text-primary border border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Job Details
            </button>
            <button
              onClick={() => setActiveTab("applicants")}
              className={`px-4 py-1 rounded-full text-lg font-bold transition ${
                activeTab === "applicants"
                  ? "bg-blue-100 text-primary border border-primary"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Tagged Applicants
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="">
        {activeTab === "details" && (
          <TodoDetailModal
            todoId={todoId}
            onClose={handleClose}
            setActiveTab={setActiveTab}
            onOpenApplicantForm={handleOpenApplicantForm}
          />
        )}

        {activeTab === "applicants" && (
          <div className="space-y-0 relative">
            {/* ✅ Big Plus Button - Floating Action Button */}
            <button
              onClick={() => setIsSheetOpen(true)}
              className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
              title="Add Multiple Applicants"
            >
              <Plus className="w-8 h-8" />
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-4 pb-4"></h1>
            {jobId && todoData ? (
              <>
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-lg overflow-y-auto"
                  >
                    <SheetHeader>
                      <SheetTitle className="text-2xl font-bold text-gray-900">
                        Add Applicants
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-0">
                      {/* <MultipleApplicantsForm
                        initialJobId={jobId}
                        onFormSubmitSuccess={handleFormSubmitSuccess}
                      /> */}
                      <ApplicantSearchAndTag
                        initialJobId={jobId}
                        onFormSubmitSuccess={() => {
                          setRefreshKey((prev) => prev + 1);
                        }}
                        initialJobTitle={jobTiitle}
                        currentUserEmail={userEmail}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <TaggedApplicants
                  key={`tagged-applicants-${refreshKey}`}
                  jobId={jobId}
                  ownerEmail={userEmail || ""}
                  todoData={todoData}
                  refreshTrigger={refreshKey}
                  onRefresh={() => setRefreshKey((prev) => prev + 1)}
                  job_title={jobTiitle}
                  companyname={companyName}
                />
              </>
            ) : (
              <p className="text-red-500">
                Loading todo details or job ID not found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
