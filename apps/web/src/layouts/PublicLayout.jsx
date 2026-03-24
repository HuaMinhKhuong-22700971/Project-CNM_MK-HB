import { Footer } from "../components/marketplace/Footer";
import { MainHeader } from "../components/marketplace/MainHeader";
import { TopBar } from "../components/marketplace/TopBar";
import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="market-shell">
      <div className="market-sticky">
        <TopBar />
        <MainHeader />
      </div>
      <main className="market-main">
        <div className="market-container">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
