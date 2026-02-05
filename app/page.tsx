import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, FileText, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="h-16 w-16 text-sky-800" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            StepUp Admin OS
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive management system for educational programs. Track students, manage groups, monitor attendance, and gain insights into your program's performance.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-sky-800 hover:bg-sky-900">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/mentor-report">
              <Button size="lg" className="bg-white hover:bg-gray-200"">
                Submit Mentor Report
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-sky-800" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              People Management
            </h3>
            <p className="text-gray-600 text-sm">
              Manage students and mentors with detailed profiles, contact information, and skill levels.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-sky-800" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Group Organization
            </h3>
            <p className="text-gray-600 text-sm">
              Create and organize learning groups by level, schedule, and assigned mentors.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-sky-800" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Class Logs
            </h3>
            <p className="text-gray-600 text-sm">
              Track class sessions with topics, attendance, and notes for comprehensive records.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-sky-800" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics Dashboard
            </h3>
            <p className="text-gray-600 text-sm">
              Get insights with visual analytics on attendance, participation, and program metrics.
            </p>
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              For Mentors
            </h2>
            <p className="text-gray-600 mb-4">
              Submit class reports quickly using your PIN code. No account needed.
            </p>
            <Link href="/mentor-report">
              <Button variant="outline" className="border-sky-800 text-sky-800 hover:bg-sky-50">
                Go to Mentor Report
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
