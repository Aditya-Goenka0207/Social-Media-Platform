import NavbarComponent from "@/Components/Navbar";
import React from "react";

function UserLayout({ children }) {
  return (
    <div>
      <NavbarComponent />
      <main style={{ minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}

export default UserLayout;