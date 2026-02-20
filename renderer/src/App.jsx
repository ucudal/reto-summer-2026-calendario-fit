import { useState } from "react";
import Docentes from "./components/Docentes";

function App() {
  const [page, setPage] = useState("home"); // 'home' | 'docentes'

  return (
    <div>
      {page === "home" ? (
        <main style={{ padding: 24 }}>
          <h1>Calendario Fit</h1>
          <p>Página principal provisional. Abrí el módulo de Docentes:</p>
          <button onClick={() => setPage("docentes")}>Abrir Docentes</button>
        </main>
      ) : (
        <Docentes onBack={() => setPage("home")} />
      )}
    </div>
  );
}

export default App;
