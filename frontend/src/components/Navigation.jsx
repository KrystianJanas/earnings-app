import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { FiHome, FiPlus, FiBarChart, FiSettings, FiUsers, FiUserCheck, FiList } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { media } from '../styles/theme'

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px ${({ theme }) => theme.spacing.sm};
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  z-index: 100;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);

  ${media.lg`
    display: none;
  `}
`

const NavContent = styled.div`
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
`

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  min-width: 56px;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight};
  }

  &:hover:not(.active) {
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.surface};
  }

  svg {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }

  span {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  @media (max-width: 400px) {
    padding: 8px 8px;
    min-width: 48px;
    
    svg {
      font-size: 1.35rem;
    }
    
    span {
      font-size: 0.65rem;
    }
  }
`

const Navigation = () => {
  const { currentCompany } = useAuth()
  const isOwner = currentCompany?.userRole === 'owner'

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

        <NavItem to="/clients">
          <FiUserCheck />
          <span>Klienci</span>
        </NavItem>

        {isOwner && (
          <NavItem to="/employees">
            <FiUsers />
            <span>Pracownicy</span>
          </NavItem>
        )}

        {isOwner && (
          <NavItem to="/services">
            <FiList />
            <span>Usługi</span>
          </NavItem>
        )}

        <NavItem to="/settings">
          <FiSettings />
          <span>Ustawienia</span>
        </NavItem>
      </NavContent>
    </NavContainer>
  )
}

export default Navigation
