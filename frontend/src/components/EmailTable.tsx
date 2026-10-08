import React from "react";
import { Email } from "../types/email";

interface EmailTableProps {
    emails: Email[];
    loading?: boolean;
    type?: "scheduled" | "sent";
}

const EmailTable: React.FC<EmailTableProps> = ({ emails, loading = false, type = "scheduled" }) => {
    if (loading) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
                        <p className="text-sm text-gray-500">Loading emails...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (emails.length === 0) return null;

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Recipient</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Subject</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {type === "scheduled" ? "Scheduled At" : "Sent At"}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {emails.map((email) => (
                            <tr key={email.id} className="transition hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="max-w-[220px] truncate text-sm font-medium text-gray-900">{email.recipient}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-[280px] truncate text-sm text-gray-700">{email.subject || "(No subject)"}</div>
                                </td>
                                <td className="px-6 py-4"><StatusBadge status={email.status} /></td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">
                                        {formatDate(type === "scheduled" ? email.scheduledAt : email.sentAt)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="border-t border-gray-200 px-6 py-3">
                <p className="text-xs text-gray-500">Showing {emails.length} email{emails.length !== 1 ? "s" : ""}</p>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: Email["status"] }> = ({ status }) => {
    const styles: Record<Email["status"], string> = {
        scheduled: "bg-blue-50 text-blue-700",
        processing: "bg-yellow-50 text-yellow-700",
        sent: "bg-green-50 text-green-700",
        failed: "bg-red-50 text-red-700",
    };
    const labels: Record<Email["status"], string> = {
        scheduled: "Scheduled",
        processing: "Processing",
        sent: "Sent",
        failed: "Failed",
    };
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>●&nbsp;{labels[status]}</span>;
};

const formatDate = (date?: string) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
};

export default EmailTable;
