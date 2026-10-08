import React, { useRef, useState } from "react";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    selectedFile?: File | null;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    selectedFile = null,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState("");

    const handleFileChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const extension = file.name
            .split(".")
            .pop()
            ?.toLowerCase();

        if (extension !== "csv" && extension !== "txt") {
            setError("Only CSV and TXT files are supported.");
            onFileSelect(null);

            if (inputRef.current) {
                inputRef.current.value = "";
            }

            return;
        }

        if (file.size === 0) {
            setError("The selected file is empty.");
            onFileSelect(null);
            return;
        }

        setError("");
        onFileSelect(file);
    };

    const handleRemove = () => {
        setError("");
        onFileSelect(null);

        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div className="w-full">
            <label className="mb-2 block text-sm font-medium text-gray-700">
                Upload Leads
            </label>

            {!selectedFile ? (
                <button
                    type="button"
                    onClick={handleClick}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-gray-500 hover:bg-gray-100"
                >
                    {/* Upload Icon */}
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6 text-gray-600"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-3L12 7.5m0 0l4.5 6m-4.5-6v9"
                            />
                        </svg>
                    </div>

                    <p className="text-sm font-medium text-gray-900">
                        Click to upload your leads
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                        CSV or TXT files only
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Maximum recommended size: 10 MB
                    </p>
                </button>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-4">

                        {/* File Information */}
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-5 w-5 text-gray-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25A3.375 3.375 0 004.875 5.625v12.75A3.375 3.375 0 008.25 21.75h7.5a3.375 3.375 0 003.375-3.375v-4.125z"
                                    />
                                </svg>
                            </div>

                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-900">
                                    {selectedFile.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>

                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                onChange={handleFileChange}
                className="hidden"
            />

            {error && (
                <div className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
                Your file should contain email addresses, one per line or in
                a CSV column.
            </p>
        </div>
    );
};

const formatFileSize = (size: number): string => {
    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default FileUpload;
