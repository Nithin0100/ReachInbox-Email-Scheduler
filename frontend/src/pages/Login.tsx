import React from "react";
import { getGoogleLoginUrl } from "../services/api";

const Login: React.FC = () => {
    const handleGoogleLogin = () => {
        window.location.href = getGoogleLoginUrl();
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">

                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black text-white">
                        <span className="text-2xl font-bold">
                            R
                        </span>
                    </div>

                    <h1 className="mt-5 text-2xl font-bold text-gray-900">
                        ReachInbox
                    </h1>

                    <p className="mt-2 text-center text-sm text-gray-500">
                        Schedule and manage your emails effortlessly
                    </p>
                </div>

                {/* Login Card */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-center text-lg font-semibold text-gray-900">
                            Welcome back
                        </h2>

                        <p className="mt-1 text-center text-sm text-gray-500">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        {/* Google Icon */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M21.805 12.23C21.805 11.47 21.745 10.74 21.515 10.04H12.2V14.42H17.035C16.83 15.51 16.21 16.43 15.275 17.05V19.96H19.04C21.245 17.93 21.805 15.25 21.805 12.23Z"
                                fill="#4285F4"
                            />

                            <path
                                d="M12.2 21.9C15.355 21.9 18 20.87 19.04 19.96L15.275 17.05C14.235 17.75 12.91 18.17 12.2 18.17C9.15 18.17 6.56 16.1 5.62 13.32H1.73V16.32C3.76 19.83 7.62 21.9 12.2 21.9Z"
                                fill="#34A853"
                            />

                            <path
                                d="M5.62 13.32C5.385 12.62 5.25 11.875 5.25 11.1C5.25 10.325 5.385 9.58 5.62 8.88V5.88H1.73C0.94 7.45 0.5 9.18 0.5 11.1C0.5 13.02 0.94 14.75 1.73 16.32L5.62 13.32Z"
                                fill="#FBBC05"
                            />

                            <path
                                d="M12.2 4.03C13.92 4.03 15.46 4.62 16.67 5.78L19.125 3.325C17.62 1.915 15.355 1.05 12.2 1.05C7.62 1.05 3.76 3.12 1.73 6.63L5.62 9.63C6.56 6.85 9.15 4.03 12.2 4.03Z"
                                fill="#EA4335"
                            />
                        </svg>

                        Continue with Google
                    </button>
                </div>

                {/* Footer */}
                <p className="mt-8 text-center text-xs leading-5 text-gray-400">
                    By continuing, you agree to use ReachInbox for
                    legitimate email communication.
                </p>
            </div>
        </div>
    );
};

export default Login;
