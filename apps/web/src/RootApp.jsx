import { AppRouter } from "./routes/AppRouter";
import { RealtimeToast } from "./components/RealtimeToast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppRouter />
        <RealtimeToast />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
