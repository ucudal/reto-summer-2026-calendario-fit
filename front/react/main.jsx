/*
  Punto de entrada de React.
  - Busca #root
  - Crea root de React
  - Renderiza App
*/

const rootElement = document.getElementById("root");
if (ReactDOM.createRoot) {
  const reactRoot = ReactDOM.createRoot(rootElement);
  reactRoot.render(<App />);
} else {
  ReactDOM.render(<App />, rootElement);
}
