import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useUI } from "@/context/UIContext";

interface LayoutProps {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const { theme } = useUI();

  return (
    <div
      className={`flex flex-col min-h-screen ${theme === "dark" ? "dark" : ""} ${className ?? ""}`}
    >
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
