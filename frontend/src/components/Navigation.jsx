import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { FiHome, FiPlus, FiBarChart, FiSettings, FiUsers, FiUserCheck } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { media } from '../styles/theme'

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  backdrop-filter: ${({ theme }) => theme.blur.md};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  padding: 8px ${({ theme }) => theme.spacing.sm};
  z-index: 100;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  ${media.lg`
    display: none;
  `}
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
  transition: all ${({ theme }) => theme.transitions.normal};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  min-height: 44px;
  justify-content: center;
  position: relative;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primaryLight};
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
          <span>Klientki</span>
        </NavItem>

        {isOwner && (
          <NavItem to="/employees">
            <FiUsers />
            <span>Pracownicy</span>
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