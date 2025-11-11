import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
export const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(App, {})
    }
]);
