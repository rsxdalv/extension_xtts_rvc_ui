import React from "react";
import { TrashIcon } from "lucide-react";
export default ({ Button }) => {
    const [huggingFaceCache, setHuggingFaceCache] = React.useState({
        headers: [],
        rows: [],
    });
    const [loading, setLoading] = React.useState(false);
    const [sortKey, setSortKey] = React.useState("repo_id");
    const [sortDirection, setSortDirection] = React.useState("asc");
    const fetchHuggingFaceCache = async () => {
        setLoading(true);
        const response = await fetch("/api/gradio/scan_huggingface_cache_api", {
            method: "POST",
        });
        const result = await response.json();
        setHuggingFaceCache(result);
        setLoading(false);
    };
    React.useEffect(() => {
        fetchHuggingFaceCache();
    }, []);
    if (loading && !huggingFaceCache.headers.length) {
        return React.createElement("div", null, "Loading HuggingFace Cache...");
    }
    const { rows } = huggingFaceCache;
    const finalHeaderSelection = [
        "repo_id",
        "repo_type",
        "refs",
        "size_on_disk_str",
        "commit_hash",
        // "repo_size_on_disk",
        // "revision_size_on_disk",
        // "nb_files",
        "last_accessed_str",
        "last_modified_str",
        // "last_modified",
        // "snapshot_path",
        "delete",
    ];
    const deleteRevision = async (commit_hash) => {
        const response = await fetch("/api/gradio/delete_huggingface_cache_revisions", {
            method: "POST",
            body: JSON.stringify({
                commit_hash,
            }),
        });
        await response.json();
        fetchHuggingFaceCache();
    };
    const cellRenderer = (header, row) => {
        const cell = row[header];
        if (header === "commit_hash") {
            return React.createElement("span", { title: cell }, cell.substring(0, 8) + "...");
        }
        if (header === "repo_id") {
            return (React.createElement("a", { href: `https://huggingface.co/${cell}`, target: "_blank", rel: "noreferrer", className: "hover:underline" }, cell));
        }
        if (header === "delete") {
            return (React.createElement(Button, { variant: "destructive", onClick: () => deleteRevision(row["commit_hash"]) },
                "Delete",
                React.createElement(TrashIcon, { className: "ml-2 h-5 w-5 flex-shrink-0" })));
        }
        return cell;
    };
    const sortRows = (header, rows, sortDirection) => {
        if (header === "delete") {
            return rows;
        }
        const getValue = (row) => {
            if (header === "size_on_disk_str") {
                return row["revision_size_on_disk"];
            }
            if (header === "last_accessed_str") {
                return row["last_accessed"];
            }
            if (header === "last_modified_str") {
                return row["last_modified"];
            }
            if (typeof row[header] === "string") {
                return row[header].toLowerCase();
            }
            return row[header];
        };
        return rows.sort((a, b) => {
            const aValue = getValue(a);
            const bValue = getValue(b);
            if (sortDirection === "asc") {
                if (aValue < bValue) {
                    return -1;
                }
                if (aValue > bValue) {
                    return 1;
                }
                return 0;
            }
            else {
                if (aValue > bValue) {
                    return -1;
                }
                if (aValue < bValue) {
                    return 1;
                }
                return 0;
            }
        });
    };
    return (React.createElement("div", { className: "flex flex-col gap-2 w-full justify-center" },
        React.createElement("h1", { className: "text-xl text-gray-900" }, "HuggingFace Cache"),
        React.createElement("p", null, "The following table shows all of the 'revisions' that have been cached by HuggingFace for all of the projects that you have used in the past. You can delete any of these revisions by clicking the 'Delete' button."),
        React.createElement("p", null,
            "Note that if the files are still being used by another revision, they will not be deleted. ",
            React.createElement("br", null),
            "Files will only be deleted once no revision is using them. ",
            React.createElement("br", null),
            "(For example, when all of the 'facebook/musicgen-small' revisions are deleted, the files will be deleted.)"),
        React.createElement("div", { className: "overflow-x-scroll w-full" },
            React.createElement("div", { className: "align-middle inline-block w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200" },
                React.createElement("table", { className: "w-full" },
                    React.createElement("thead", null,
                        React.createElement("tr", null, finalHeaderSelection.map((header) => (React.createElement("th", { key: header, className: "px-2 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 cursor-pointer", onClick: () => {
                                setSortKey(header);
                                const newSortDirection = header === sortKey
                                    ? sortDirection === "asc"
                                        ? "desc"
                                        : "asc"
                                    : "asc";
                                setSortDirection(newSortDirection);
                                setHuggingFaceCache({
                                    ...huggingFaceCache,
                                    rows: sortRows(header, rows, newSortDirection),
                                });
                            } },
                            header.replace(/_/g, " ").replace("str", ""),
                            header === sortKey && sortDirection === "asc" && " ↓",
                            header === sortKey && sortDirection === "desc" && " ↑"))))),
                    React.createElement("tbody", { className: "bg-white divide-y divide-gray-200" }, rows.map((row) => (React.createElement("tr", { key: row["commit_hash"] }, finalHeaderSelection.map((header, index) => (React.createElement("td", { key: index, className: "px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900" }, cellRenderer(header, row)))))))))))));
};
