import { useState } from "react";
import { AppProvider } from "./context/AppContext";
import { useTheme } from "./hooks/useTheme";
import { useHideAmount } from "./hooks/useHideAmount";
import { useRecurringCheck } from "./hooks/useRecurringCheck";
import { useReminder } from "./hooks/useReminder";
import { useAuth } from "./hooks/useAuth";
import Sidebar from "./components/layout/Sidebar";
import BottomNav from "./components/layout/BottomNav";
import TopBar from "./components/layout/TopBar";
import ReminderPromptDialog from "./components/layout/ReminderPromptDialog";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import RecurringPage from "./pages/RecurringPage";
import ReportsPage from "./pages/ReportsPage";
import SavingsGoalsPage from "./pages/SavingsGoalsPage";
import WishlistPage from "./pages/WishlistPage";
import AccountsPage from "./pages/AccountsPage";
import ChallengesPage from "./pages/ChallengesPage";
import LoginPage from "./pages/LoginPage";
import RecurringDueDialog from "./components/recurring/RecurringDueDialog";

const KNOWN_PAGES = ["dashboard", "transactions", "recurring", "reports", "savings", "wishlist", "accounts", "challenges"];

function AppContent({ user, onSignOut }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { hideAmount, toggleHideAmount } = useHideAmount();
  const { dueItems, markChecked } = useRecurringCheck();
  const { showPrompt, enableReminder, dismissPrompt } = useReminder();

  return (
    <div className="flex h-screen bg-transparent dark:bg-gray-950">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          theme={theme}
          onToggleTheme={toggleTheme}
          hideAmount={hideAmount}
          onToggleHideAmount={toggleHideAmount}
          user={user}
          onSignOut={onSignOut}
        />
        <main key={activePage} className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6 animate-fade-in">
          {activePage === "dashboard" && <DashboardPage hideAmount={hideAmount} />}
          {activePage === "transactions" && <TransactionsPage hideAmount={hideAmount} />}
          {activePage === "recurring" && <RecurringPage />}
          {activePage === "reports" && <ReportsPage />}
          {activePage === "savings" && <SavingsGoalsPage />}
          {activePage === "wishlist" && <WishlistPage />}
          {activePage === "accounts" && <AccountsPage />}
          {activePage === "challenges" && <ChallengesPage />}
          {!KNOWN_PAGES.includes(activePage) && (
            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 rounded-2xl shadow-soft p-8 text-center">
              <p className="text-sm text-gray-400">
                Halaman ini akan tersedia di phase berikutnya.
              </p>
            </div>
          )}
        </main>
      </div>
      <BottomNav activePage={activePage} onNavigate={setActivePage} />

      <RecurringDueDialog dueItems={dueItems} onClose={markChecked} />
      <ReminderPromptDialog
        open={showPrompt && dueItems.length === 0}
        onEnable={enableReminder}
        onDismiss={dismissPrompt}
      />
    </div>
  );
}

export default function App() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm font-light text-gray-400">Memuat...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppProvider userId={user.id}>
      <AppContent user={user} onSignOut={signOut} />
    </AppProvider>
  );
}
