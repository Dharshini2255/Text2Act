import { useState } from "react";

export default function TopBar({ pageTitle, onMenuClick, onSearch, onShare }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    onSearch?.(query);
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: pageTitle || document.title || "Text2Act",
        url,
      }).catch(() => {
        navigator.clipboard?.writeText(url).then(() => alert("Link copied to clipboard."));
      });
    } else {
      navigator.clipboard?.writeText(url).then(() => alert("Link copied to clipboard."));
    }
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-outline-light btn-sm" onClick={onMenuClick}>
          ☰
        </button>
        <span className="navbar-brand mb-0 h1">Text2Act</span>
        {pageTitle && (
          <span className="text-white-50 d-none d-md-inline">| {pageTitle}</span>
        )}
      </div>

      <div className="input-group w-50">
        <input
          type="text"
          className="form-control"
          placeholder="Search your data..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="btn btn-outline-secondary" onClick={handleSearch}>
          <i className="bi bi-search"></i>
        </button>
      </div>

      <button className="btn btn-outline-light btn-sm" onClick={handleShare}>
        🔗 Share
      </button>
    </nav>
  );
}
