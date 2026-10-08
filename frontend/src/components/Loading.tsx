import React from "react";

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
    message = "Loading...",
    fullScreen = false,
}) => {
    return (
        <div
            className={`flex items-center justify-center ${
                fullScreen ? "min-h-screen" : "py-12"
            }`}
        >
            <div className="flex flex-col items-center justify-center gap-4">
                {/* Spinner */}
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

                {/* Loading Message */}
                <p className="text-sm text-gray-500">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default Loading;
