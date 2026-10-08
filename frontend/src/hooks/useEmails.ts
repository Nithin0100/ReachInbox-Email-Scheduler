import { useCallback, useEffect, useState } from "react";
import {
    getScheduledEmails,
    getSentEmails,
    searchEmails,
} from "../services/api";
import { Email } from "../types/email";

const useEmails = () => {
    const [scheduledEmails, setScheduledEmails] =
        useState<Email[]>([]);

    const [sentEmails, setSentEmails] =
        useState<Email[]>([]);

    const [loading, setLoading] =
        useState<boolean>(true);

    const [error, setError] =
        useState<string>("");

    const [searchLoading, setSearchLoading] =
        useState<boolean>(false);

    const loadEmails = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                scheduledResponse,
                sentResponse,
            ] = await Promise.all([
                getScheduledEmails(),
                getSentEmails(),
            ]);

            setScheduledEmails(
                scheduledResponse.data || []
            );

            setSentEmails(
                sentResponse.data || []
            );
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to load emails.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const search = useCallback(
        async (query: string) => {
            if (!query.trim()) {
                await loadEmails();
                return;
            }

            try {
                setSearchLoading(true);
                setError("");

                const response =
                    await searchEmails(query);

                const results =
                    response.data || [];

                setScheduledEmails(
                    results.filter(
                        (email) =>
                            email.status === "scheduled" ||
                            email.status === "processing"
                    )
                );

                setSentEmails(
                    results.filter(
                        (email) =>
                            email.status === "sent"
                    )
                );
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Search failed.");
                }
            } finally {
                setSearchLoading(false);
            }
        },
        [loadEmails]
    );

    const refresh = useCallback(async () => {
        await loadEmails();
    }, [loadEmails]);

    useEffect(() => {
        loadEmails();
    }, [loadEmails]);

    return {
        scheduledEmails,
        sentEmails,

        loading,
        searchLoading,
        error,

        loadEmails,
        refresh,
        search,
    };
};

export default useEmails;
