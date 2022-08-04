import { createRoot } from "react-dom/client";
import { Experience } from "./Experience";

// Styling
import "./index.css";
import "./reset.css";

const App = () => {
  return <Experience />;
};

// Render
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
