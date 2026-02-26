import { useState } from "react";
import TopBar from "../components/TopBar";
import SidePanel from "../components/SidePanel";
import TileGrid from "../components/TitleGrid";
import ChatBox from "../components/ChatBox";
import RightPanel from "../components/RightPanel";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <TopBar pageTitle="Home" onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearch={(query) => setSearchQuery(query)} />

      <div style={{ height: "calc(100vh - 56px)", overflow: "hidden", marginLeft: sidebarOpen ? 200 : 0 }}>
        {sidebarOpen && (
          <div style={{ position: "fixed", left: 0, top: 56, bottom: 0, width: 200, zIndex: 1050, overflowY: "auto" }}>
            <SidePanel />
          </div>
        )}
        <div className="container-fluid h-100">
          <div className="row g-0 h-100">
            <div className="col p-4 bg-light overflow-auto">
              <TileGrid searchQuery={searchQuery} />
            </div>
            <div className="col-3 bg-white border-start overflow-auto">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
