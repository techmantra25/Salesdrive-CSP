import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./api/axiosConfig.js"; // Import axios config
import { ContextProvider } from "./context/ContextProvider.jsx";
import "./index.css";
import store from "./redux/store.js";
import { SiteClosed } from "./pages/UnderMaintenance/SiteClosed.jsx";
import { UnderMaintenance } from "./pages/UnderMaintenance/UnderMaintenance.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <ContextProvider>
        <App />
        {/* <SiteClosed /> */}
        {/* <UnderMaintenance /> */}
      </ContextProvider>
    </Provider>
  </BrowserRouter>
);
