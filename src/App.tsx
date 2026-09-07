import { RouterProvider } from "react-router-dom";
import { Router } from "./routes/router";
import { useTokenRefresh } from "./hooks/useTokenRefresh";

const App = () => {
  // Starts automatic token refresh
  useTokenRefresh();

  return (
    <RouterProvider router={Router} />
  );
};

export default App;