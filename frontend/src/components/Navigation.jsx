import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { FiHome, FiPlus, FiBarChart, FiSettings, FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px ${({ theme }) => theme.spacing.sm};
  z-index: 100;
`

const NavContent = styled.div`
  max-width: 428px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
`

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-height: 44px;
  justify-content: center;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  span {
    font-size: 0.75rem;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    svg {
      font-size: 1.4rem;
      margin-bottom: 2px;
    }
    
    span {
      font-size: 0.7rem;
    }
  }
`

const LogoutButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  min-height: 44px;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }

  svg {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  span {
    font-size: 0.75rem;
    font-weight: 500;
  }

  @media (max-width: 480px) {
    svg {
      font-size: 1.4rem;
      margin-bottom: 2px;
    }
    
    span {
      font-size: 0.7rem;
    }
  }
`

const Navigation = () => {
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <NavContainer>
      <NavContent>
        <NavItem to="/" end>
          <FiHome />
          <span>Główna</span>
        </NavItem>

        <NavItem to="/add-earnings">
          <FiPlus />
          <span>Dodaj</span>
        </NavItem>

        <NavItem to="/monthly">
          <FiBarChart />
          <span>Miesięcznie</span>
        </NavItem>

        <NavItem to="/settings">
          <FiSettings />
          <span>Ustawienia</span>
        </NavItem>

        <LogoutButton onClick={handleLogout}>
          <FiLogOut />
          <span>Wyloguj</span>
        </LogoutButton>
      </NavContent>
    </NavContainer>
  )
}

export default Navigation