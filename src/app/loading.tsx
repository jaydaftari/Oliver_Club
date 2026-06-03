export default function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label="Loading"
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid #E0DCD1",
          borderTopColor: "#5B5A3C",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
