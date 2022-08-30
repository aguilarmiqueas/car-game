import { createRoot } from "react-dom/client";
import { Experience } from "./Experience";
import { Suspense } from "react";

// Styling
import "./index.css";
import "./reset.css";

const App = () => {
  return (
    <Suspense fallback={null}>
      <Experience />
    </Suspense>
  );
};

// Render
const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
