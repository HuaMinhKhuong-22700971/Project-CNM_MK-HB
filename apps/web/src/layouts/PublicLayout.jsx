import { Footer } from "../components/marketplace/Footer";
import { MainHeader } from "../components/marketplace/MainHeader";
import { TopBar } from "../components/marketplace/TopBar";
import { CustomCursor } from "../components/common/CustomCursor";
import { Outlet, useLocation } from "react-router-dom";

export function PublicLayout() {
  const location = useLocation();
  const isBuilder = location.pathname.includes("pc-builder") || location.pathname.includes("pcbuilder");

  return (
    <div className="market-shell">
      <CustomCursor />
      <div className="market-sticky">
        <TopBar />
        <MainHeader />
      </div>
      <main className="market-main">
        <div className={isBuilder ? "market-container market-container--wide" : "market-container"}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}



