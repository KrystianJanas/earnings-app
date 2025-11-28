import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { FiHome, FiPlus, FiBarChart, FiSettings, FiUsers, FiChevronDown, FiLogOut, FiUserCheck, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { media } from '../styles/theme'
import CreateCompany from './CreateCompany'

const SidebarContainer = styled.aside`
  display: none;

  ${media.lg`
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 300px;
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.cardBg} 0%, ${({ theme }) => theme.colors.backgroundSecondary} 100%);
    backdrop-filter: ${({ theme }) => theme.blur.md};
    -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
    border-right: 1px solid ${({ theme }) => theme.colors.borderLight};
    padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.md};
    z-index: 100;
    box-shadow: 12px 0 48px rgba(0, 0, 0, 0.25);
  `}
`

const Logo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};

  h1 {
    font-size: 1.75rem;
    font-weight: 800;
    background: ${({ theme }) => theme.colors.gradient.primary};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
  }

  p {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-top: 6px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`

const CompanySelector = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
`

const CompanyButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.08) 100%);
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.12) 100%);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
  }
`

const CompanyInfo = styled.div`
  text-align: left;
  flex: 1;
`

const CompanyName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 2px;
`

const CompanyRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.cardBg};
  backdrop-filter: ${({ theme }) => theme.blur.md};
  -webkit-backdrop-filter: ${({ theme }) => theme.blur.md};
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  margin-top: 12px;
  overflow: hidden;
  z-index: 1000;
`

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-align: left;
  font-size: 0.9rem;

  &:hover {
    background: rgba(139, 92, 246, 0.15);
    padding-left: calc(${({ theme }) => theme.spacing.md} + 4px);
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  }

  svg {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
`

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
`

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:first-child {
    margin-top: 0;
  }
`

const NavSectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: ${({ theme }) => theme.spacing.md} 0;
  padding-left: ${({ theme }) => theme.spacing.sm};
`

const NavItem = styled(motion(NavLink))`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 14px 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 500;
  font-size: 0.95rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${({ theme }) => theme.colors.gradient.primary};
    transform: scaleY(0);
    transition: transform ${({ theme }) => theme.transitions.normal};
  }

  &.active {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%);
    color: ${({ theme }) => theme.colors.primary};
    box-shadow: inset 0 0 20px rgba(139, 92, 246, 0.15);

    &::before {
      transform: scaleY(1);
    }

    svg {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  &:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.08) 100%);
    color: ${({ theme }) => theme.colors.text.primary};
    transform: translateX(4px);

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    font-size: 1.3rem;
    min-width: 24px;
    transition: all ${({ theme }) => theme.transitions.normal};
    color: ${({ theme }) => theme.colors.text.muted};
  }

  span {
    transition: all ${({ theme }) => theme.transitions.normal};
  }
`

const Sidebar = () => {
  const { currentCompany, companies, switchCompany, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showCreateCompany, setShowCreateCompany] = useState(false)
  const isOwner = currentCompany?.userRole === 'owner'

  const getRoleLabel = (role) => {
    switch (role) {
      case 'owner':
        return 'Właściciel'
      case 'employee':
        return 'Pracownik'
      default:
        return 'Brak roli'
    }
  }

  const handleCompanySwitch = async (companyId) => {
    if (companyId !== currentCompany?.id) {
      await switchCompany(companyId)
    }
    setIsDropdownOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsDropdownOpen(false)
  }

  if (!currentCompany) {
    return null
  }

  if (showCreateCompany) {
    return (
      <CreateCompany
        onBack={() => setShowCreateCompany(false)}
        onSuccess={() => setShowCreateCompany(false)}
      />
    )
  }

  return (
    <SidebarContainer>
      <Logo>
        <h1>Paulinka</h1>
        <p>Zarządzanie salonem</p>
      </Logo>

      <CompanySelector>
        <CompanyButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <CompanyInfo>
            <CompanyName>{currentCompany.name}</CompanyName>
            <CompanyRole>{getRoleLabel(currentCompany.userRole)}</CompanyRole>
          </CompanyInfo>
          <FiChevronDown />
        </CompanyButton>

        {isDropdownOpen && (
          <>
            <Overlay onClick={() => setIsDropdownOpen(false)} />
            <Dropdown>
              {companies.map((company) => (
                <DropdownItem
                  key={company.id}
                  onClick={() => handleCompanySwitch(company.id)}
                >
                  <div>
                    <CompanyName>{company.name}</CompanyName>
                    <CompanyRole>{getRoleLabel(company.userRole)}</CompanyRole>
                  </div>
                </DropdownItem>
              ))}
              <DropdownItem onClick={() => {
                setShowCreateCompany(true)
                setIsDropdownOpen(false)
              }}>
                <FiPlus />
                Utwórz nowy salon
              </DropdownItem>
              <DropdownItem onClick={handleLogout}>
                <FiLogOut />
                Wyloguj się
              </DropdownItem>
            </Dropdown>
          </>
        )}
      </CompanySelector>

      <NavList>
        <NavSection>
          <NavItem to="/" end whileHover={{ x: 4 }} whileTap={{ x: 2 }}>
            <FiHome />
            <span>Strona główna</span>
          </NavItem>
        </NavSection>

        <NavSection>
          <NavSectionTitle>Zarządzanie</NavSectionTitle>
          <NavItem to="/add-earnings" whileHover={{ x: 4 }} whileTap={{ x: 2 }}>
            <FiPlus />
            <span>Dodaj obrót</span>
          </NavItem>

          <NavItem to="/monthly" whileHover={{ x: 4 }} whileTap={{ x: 2 }}>
            <FiBarChart />
            <span>Podsumowanie</span>
          </NavItem>

          <NavItem to="/clients" whileHover={{ x: 4 }} whileTap={{ x: 2 }}>
            <FiUserCheck />
            <span>Klientki</span>
          </NavItem>
        </NavSection>

        {isOwner && (
          <NavSection>
            <NavSectionTitle>Admin</NavSectionTitle>
            <NavItem to="/employees" whileHover={{ x: 4 }} whileTap={{ x: 2 }}>
              <FiUsers />
              <span>Pracownicy</span>
            </NavItem>
          </NavSection>
        )}

        <NavSection style={{ marginTop: 'auto', marginBottom: 0 }}>
          <NavItem to="/settings" whileHover={{ x: 4 }} whileTap={{ x: 2 }}>
            <FiSettings />
            <span>Ustawienia</span>
          </NavItem>
        </NavSection>
      </NavList>
    </SidebarContainer>
  )
}

export default Sidebar
