import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../../styles/theme";
import { useAuth } from "../../context/AuthContext";
import {
  FaHome,
  FaUtensils,
  FaDumbbell,
  FaUser,
  FaSignOutAlt,
  FaBook,
  FaCalendarAlt,
} from "react-icons/fa";

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${theme.colors.cardBackgroundSolid};
  border-top: 1px solid ${theme.colors.primary};
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  z-index: 100;

  @media (min-width: 768px) {
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: auto;
    width: 250px;
    padding: 2rem 0;
    border-top: none;
    border-right: 1px solid ${theme.colors.primary};
  }
`;

const NavItemGroup = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;

  @media (min-width: 768px) {
    flex-direction: column;
    width: auto;
    gap: 1rem;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: ${theme.colors.textMuted};
  padding: 0.5rem 1rem;
  transition: all 0.2s ease-in-out;

  span {
    font-size: 1.5rem;
  }
  p {
    font-size: 0.7rem;
    margin-top: 0.25rem;
    font-family: ${theme.fonts.body};
  }

  &.active {
    color: ${theme.colors.accent};
    text-shadow: 0 0 10px ${theme.colors.accent};
  }

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: flex-start;
    width: 100%;
    padding: 1.5rem 2rem;
    p {
      margin-top: 0;
      margin-left: 1rem;
      font-size: 1.1rem;
      font-family: ${theme.fonts.heading};
      letter-spacing: 1px;
    }
  }
`;

const LogoutButton = styled(NavItem).attrs({ as: "button" })`
  background: none;
  border: none;
  cursor: pointer;
`;

function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <NavContainer>
      <NavItemGroup>
        <NavItem to="/">
          <span>
            <FaHome />
          </span>{" "}
          <p>Dashboard</p>
        </NavItem>
        <NavItem to="/nutrition">
          <span>
            <FaUtensils />
          </span>{" "}
          <p>Nutrition</p>
        </NavItem>
        <NavItem to="/history/summary">
          <span>
            <FaCalendarAlt />
          </span>{" "}
          <p>History</p>
        </NavItem>
        <NavItem to="/profile">
          <span>
            <FaUser />
          </span>{" "}
          <p>Profile</p>
        </NavItem>
        <NavItem to="/workouts">
          <span>
            <FaDumbbell />
          </span>{" "}
          <p>My Workouts</p>
        </NavItem>
        <NavItem to="/history/workouts">
          <span>
            <FaBook />
          </span>{" "}
          <p>Logbook</p>
        </NavItem>
      </NavItemGroup>
      <NavItemGroup>
        <LogoutButton onClick={handleLogout}>
          <span>
            <FaSignOutAlt />
          </span>
          <p>Logout</p>
        </LogoutButton>
      </NavItemGroup>
    </NavContainer>
  );
}

export default Navbar;
