import React from "react";
import styled from "styled-components";
import Navbar from "./Navbar";
import ProfileSetupWizard from "../profile/ProfileSetupWizard";
import { useAuth } from "../../context/AuthContext";

const MainContent = styled.main`
  padding-bottom: 80px; /* Space for mobile nav */

  @media (min-width: 768px) {
    padding-left: 250px; /* Space for desktop sidebar */
    padding-bottom: 0;
  }
`;

const Layout = ({ children }) => {
  const { user } = useAuth();

  // Condition to show the wizard: user is logged in, but physicalMetrics.age is missing.
  const needsSetup =
    user && (!user.physicalMetrics || !user.physicalMetrics.age);

  return (
    <>
      {needsSetup && <ProfileSetupWizard />}
      <Navbar />
      <MainContent>{children}</MainContent>
    </>
  );
};

export default Layout;
