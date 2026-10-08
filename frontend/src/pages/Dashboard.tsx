import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import EmailTable from "../components/EmailTable";
import ComposeModal from "../components/ComposeModal";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import useEmails from "../hooks/useEmails";
import { getCurrentUser, logout } from "../services/api";
import { User } from "../types/email";

const Dashboard: React.FC = () => {
    const { scheduledEmails, sentEmails, loading, searchLoading, error, refresh, search } = useEmails();
    const [activeTab, setActiveTab] = useState<"scheduled" | "sent">("scheduled");
    const [showCompose, setShowCompose] = useState(false);
    const [query, setQuery] = useState("");
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        void getCurrentUser().then((response) => setUser(response.user));
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => { void search(query); }, 300);
        return () => window.clearTimeout(timer);
    }, [query, search]);

    const handleLogout = async () => {
        try { await logout(); } finally { window.location.href = "/"; }
    };

    if (loading) return <Loading message="Loading dashboard..." fullScreen />;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onCompose={() => setShowCompose(true)} onLogout={handleLogout} />
            <main className="mx-auto max-w-7xl px-6 py-8">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div><h1 className="text-2xl font-bold text-gray-900">Email Dashboard</h1><p className="mt-1 text-sm text-gray-500">Manage your scheduled and sent emails.</p></div>
                    <button type="button" onClick={() => setShowCompose(true)} className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800">+ Compose Email</button>
                </div>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <div className="relative flex-1">
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search recipient, subject or email body..." className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black" />
                        {searchLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Searching...</span>}
                    </div>
                    <button type="button" onClick={() => void refresh()} className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Refresh</button>
                </div>

                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">Scheduled Emails</p><p className="mt-2 text-2xl font-bold text-gray-900">{scheduledEmails.length}</p></div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">Sent Emails</p><p className="mt-2 text-2xl font-bold text-gray-900">{sentEmails.length}</p></div>
                </div>

                {error && <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"><p className="text-sm text-red-700">{error}</p><button type="button" onClick={() => void refresh()} className="text-sm font-medium text-red-700 underline">Retry</button></div>}

                <div className="mb-5 border-b border-gray-200"><div className="flex gap-8">
                    <button type="button" onClick={() => setActiveTab("scheduled")} className={`border-b-2 px-1 pb-3 text-sm font-medium ${activeTab === "scheduled" ? "border-black text-gray-900" : "border-transparent text-gray-500"}`}>Scheduled <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{scheduledEmails.length}</span></button>
                    <button type="button" onClick={() => setActiveTab("sent")} className={`border-b-2 px-1 pb-3 text-sm font-medium ${activeTab === "sent" ? "border-black text-gray-900" : "border-transparent text-gray-500"}`}>Sent <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{sentEmails.length}</span></button>
                </div></div>

                {activeTab === "scheduled" ? scheduledEmails.length > 0 ? <EmailTable emails={scheduledEmails} type="scheduled" /> : <EmptyState title="No scheduled emails" message="You haven't scheduled any emails yet." actionLabel="Compose Email" onAction={() => setShowCompose(true)} /> : sentEmails.length > 0 ? <EmailTable emails={sentEmails} type="sent" /> : <EmptyState title="No sent emails" message="Emails that have been successfully sent will appear here." />}
            </main>
            <ComposeModal isOpen={showCompose} onClose={() => setShowCompose(false)} onSuccess={() => void refresh()} />
        </div>
    );
};

export default Dashboard;
