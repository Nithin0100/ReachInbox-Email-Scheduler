import React from "react";

interface EmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    title = "No emails found",
    message = "There are no emails to display here yet.",
    actionLabel,
    onAction,
}) => {
    return (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            {/* Empty State Icon */}
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-7 w-7 text-gray-500"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0l-7.5-4.615A2.25 2.25 0 012.25 6.993V6.75"
                    />
                </svg>
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-gray-900">
                {title}
            </h3>

            {/* Message */}
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                {message}
            </p>

            {/* Optional Action */}
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
