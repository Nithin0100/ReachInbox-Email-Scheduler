import React, { useEffect, useState } from "react";
import FileUpload from "./FileUpload";
import { getCurrentUser, scheduleEmails } from "../services/api";

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const ComposeModal: React.FC<ComposeModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [recipients, setRecipients] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [scheduleAt, setScheduleAt] = useState("");
    const [delayBetweenEmails, setDelayBetweenEmails] = useState("2000");
    const [hourlyLimit, setHourlyLimit] = useState("50");
    const [senderEmail, setSenderEmail] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;

        setUserLoading(true);
        getCurrentUser()
            .then((response) => setSenderEmail(response.user.email))
            .catch(() => setSenderEmail(""))
            .finally(() => setUserLoading(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!subject.trim()) {
            return setError("Please enter a subject.");
        }

        if (!body.trim()) {
            return setError("Please enter the email body.");
        }

        if (!scheduleAt) {
            return setError("Please select a schedule time.");
        }

        if (!file && !recipients.trim()) {
            return setError("Please enter recipients or upload a CSV/TXT file.");
        }

        if (!senderEmail) {
            return setError("Your Google account is not connected for Gmail sending.");
        }

        const selectedDate = new Date(scheduleAt);

        if (
            Number.isNaN(selectedDate.getTime()) ||
            selectedDate.getTime() <= Date.now()
        ) {
            return setError("Schedule time must be in the future.");
        }

        try {
            setLoading(true);

            await scheduleEmails({
                recipients: recipients
                    .split(/[\n,]+/)
                    .map((email) => email.trim())
                    .filter(Boolean),
                subject: subject.trim(),
                body,
                startTime: selectedDate.toISOString(),
                delayBetweenEmails: Number(delayBetweenEmails),
                hourlyLimit: Number(hourlyLimit),
                file: file || undefined,
            });

            resetForm();
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setRecipients("");
        setSubject("");
        setBody("");
        setScheduleAt("");
        setDelayBetweenEmails("2000");
        setHourlyLimit("50");
        setFile(null);
        setError("");
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Compose Email
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Schedule emails to your leads
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-gray-500 hover:bg-gray-100"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-6">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Recipients
                        </label>
                        <textarea
                            value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                            placeholder="Enter email addresses separated by commas or new lines"
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <FileUpload
                        selectedFile={file}
                        onFileSelect={setFile}
                    />

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter email subject"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Email Body
                        </label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Write your email..."
                            rows={6}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Sender
                        </label>
                        <div className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                            {userLoading
                                ? "Loading Google account..."
                                : senderEmail || "Google account not connected"}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Emails are sent from the Google account you used to log in.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Schedule At
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduleAt}
                                onChange={(e) => setScheduleAt(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Delay Between Emails
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="2000"
                                    value={delayBetweenEmails}
                                    onChange={(e) =>
                                        setDelayBetweenEmails(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-14 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                    ms
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Maximum Emails Per Hour
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={hourlyLimit}
                            onChange={(e) => setHourlyLimit(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Emails over this limit are automatically rescheduled.
                        </p>
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || userLoading}
                            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? "Scheduling..." : "Schedule Emails"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ComposeModal;
