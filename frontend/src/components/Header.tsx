import React from "react";
import { User } from "../types/email";

interface HeaderProps {
    user?: User | null;
    onCompose?: () => void;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
    user,
    onCompose,
    onLogout,
}) => {
    return (
        <header className="w-full border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 items-center justify-between px-6">
                
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">
                        <span className="text-lg font-bold">R</span>
                    </div>

                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">
                            ReachInbox
                        </h1>
                        <p className="text-xs text-gray-500">
                            Email Scheduler
                        </p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-4">

                    {/* Compose Button */}
                    <button
                        onClick={onCompose}
                        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        + Compose
                    </button>

                    {/* User */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                            <span className="text-sm font-semibold text-gray-700">
                                {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.name || "User"}
                            </p>
                            <p className="max-w-48 truncate text-xs text-gray-500">
                                {user?.email || ""}
                            </p>
                            <button
                                onClick={onLogout}
                                className="text-xs text-gray-500 hover:text-gray-900"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
