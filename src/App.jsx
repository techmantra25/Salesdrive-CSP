import { useContext } from "react";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { MainRoutes } from "./Routes/MainRoutes";
import { AutoLogout } from "./components/AutoLogout";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { ThemeContext } from "./context/ContextProvider";
import { SocketProvider } from "./context/SocketContext";
import { ScrollToTopBtn } from "./components/ScrollToTopBtn";

function App() {
  const { theme } = useContext(ThemeContext);

  return (
    <>
      <div className={theme === "dark" ? "dark" : "light"}>
        {/* <SocketProvider> */}
          <AutoLogout />
          <MainRoutes />
          <ConfirmationModal />
          <ScrollToTopBtn />
          <Toaster position="top-center" reverseOrder={false} />
        {/* </SocketProvider> */}
      </div>
    </>
  );
}

export default App;
