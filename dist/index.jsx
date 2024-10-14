var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React from "react";
import { TrashIcon } from "lucide-react";
export default (function (_a) {
    var Button = _a.Button;
    var _b = React.useState({
        headers: [],
        rows: [],
    }), huggingFaceCache = _b[0], setHuggingFaceCache = _b[1];
    var _c = React.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = React.useState("repo_id"), sortKey = _d[0], setSortKey = _d[1];
    var _e = React.useState("asc"), sortDirection = _e[0], setSortDirection = _e[1];
    var fetchHuggingFaceCache = function () { return __awaiter(void 0, void 0, void 0, function () {
        var response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    return [4 /*yield*/, fetch("/api/gradio/scan_huggingface_cache_api", {
                            method: "POST",
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    setHuggingFaceCache(result);
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    React.useEffect(function () {
        fetchHuggingFaceCache();
    }, []);
    if (loading && !huggingFaceCache.headers.length) {
        return <div>Loading HuggingFace Cache...</div>;
    }
    var rows = huggingFaceCache.rows;
    var finalHeaderSelection = [
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
    var deleteRevision = function (commit_hash) { return __awaiter(void 0, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("/api/gradio/delete_huggingface_cache_revisions", {
                        method: "POST",
                        body: JSON.stringify({
                            commit_hash: commit_hash,
                        }),
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    _a.sent();
                    fetchHuggingFaceCache();
                    return [2 /*return*/];
            }
        });
    }); };
    var cellRenderer = function (header, row) {
        var cell = row[header];
        if (header === "commit_hash") {
            return <span title={cell}>{cell.substring(0, 8) + "..."}</span>;
        }
        if (header === "repo_id") {
            return (<a href={"https://huggingface.co/".concat(cell)} target="_blank" rel="noreferrer" className="hover:underline">
          {cell}
        </a>);
        }
        if (header === "delete") {
            return (<Button variant="destructive" onClick={function () { return deleteRevision(row["commit_hash"]); }}>
          Delete
          <TrashIcon className="ml-2 h-5 w-5 flex-shrink-0"/>
        </Button>);
        }
        return cell;
    };
    var sortRows = function (header, rows, sortDirection) {
        if (header === "delete") {
            return rows;
        }
        var getValue = function (row) {
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
        return rows.sort(function (a, b) {
            var aValue = getValue(a);
            var bValue = getValue(b);
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
    return (<div className="flex flex-col gap-2 w-full justify-center">
      <h1 className="text-xl text-gray-900">HuggingFace Cache</h1>
      <p>
        The following table shows all of the 'revisions' that have been cached
        by HuggingFace for all of the projects that you have used in the past.
        You can delete any of these revisions by clicking the 'Delete' button.
      </p>

      <p>
        Note that if the files are still being used by another revision, they
        will not be deleted. <br />
        Files will only be deleted once no revision is using them. <br />
        (For example, when all of the 'facebook/musicgen-small' revisions are
        deleted, the files will be deleted.)
      </p>
      <div className="overflow-x-scroll w-full">
        <div className="align-middle inline-block w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
          <table className="w-full">
            <thead>
              <tr>
                {finalHeaderSelection.map(function (header) { return (<th key={header} className="px-2 py-3 border-b border-gray-200 text-xs font-medium text-gray-500 cursor-pointer" onClick={function () {
                setSortKey(header);
                var newSortDirection = header === sortKey
                    ? sortDirection === "asc"
                        ? "desc"
                        : "asc"
                    : "asc";
                setSortDirection(newSortDirection);
                setHuggingFaceCache(__assign(__assign({}, huggingFaceCache), { rows: sortRows(header, rows, newSortDirection) }));
            }}>
                    {header.replace(/_/g, " ").replace("str", "")}
                    {header === sortKey && sortDirection === "asc" && " ↓"}
                    {header === sortKey && sortDirection === "desc" && " ↑"}
                  </th>); })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map(function (row) { return (<tr key={row["commit_hash"]}>
                  {finalHeaderSelection.map(function (header, index) { return (<td key={index} className="px-6 py-4 whitespace-no-wrap text-sm leading-5 font-medium text-gray-900">
                      {cellRenderer(header, row)}
                    </td>); })}
                </tr>); })}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
});
