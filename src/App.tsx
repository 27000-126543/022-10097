import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import TodaySignPage from "@/pages/TodaySignPage";
import IdentityPage from "@/pages/IdentityPage";
import RisksPage from "@/pages/RisksPage";
import QAPage from "@/pages/QAPage";
import SignPage from "@/pages/SignPage";

const pageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 80 : -80,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.8, 0.25, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -80 : 80,
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 0.6, 1],
    },
  }),
};

const routeOrder = ["/", "/identity", "/risks", "/qa", "/sign"];

function AnimatedRoutes() {
  const location = useLocation();
  const currentIdx = routeOrder.indexOf(location.pathname);
  const prevKey = location.state?.prevPath as string | undefined;
  const prevIdx = prevKey ? routeOrder.indexOf(prevKey) : -1;
  const direction = prevIdx === -1 ? 1 : currentIdx >= prevIdx ? 1 : -1;

  return (
    <AnimatePresence mode="wait" initial={false} custom={direction}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              <TodaySignPage />
            </motion.div>
          }
        />
        <Route
          path="/identity"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              <IdentityPage />
            </motion.div>
          }
        />
        <Route
          path="/risks"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              <RisksPage />
            </motion.div>
          }
        />
        <Route
          path="/qa"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              <QAPage />
            </motion.div>
          }
        />
        <Route
          path="/sign"
          element={
            <motion.div
              custom={direction}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full"
            >
              <SignPage />
            </motion.div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <div className="h-screen w-screen overflow-hidden bg-warmwhite">
        <AnimatedRoutes />
      </div>
    </Router>
  );
}
