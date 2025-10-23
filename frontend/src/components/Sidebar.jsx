import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { FiHome, FiPlus, FiBarChart, FiSettings, FiUsers, FiChevronDown, FiLogOut } from 'react-icons/fi'
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
    width: 280px;
    background: ${({ theme }) => theme.colors.cardBg};
    border-right: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing.lg} 0;
    z-index: 100;
  `}
`

const Logo = styled.div`
  padding: 0 ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.secondary} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  p {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-top: 4px;
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
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
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
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: 8px;
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
  background: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  svg {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text.muted};
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
  gap: 4px;
  padding: 0 ${({ theme }) => theme.spacing.md};
  flex: 1;
`

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  font-size: 0.95rem;

  &.active {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    font-size: 1.25rem;
    min-width: 24px;
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
        <NavItem to="/" end>
          <FiHome />
          <span>Strona główna</span>
        </NavItem>

        <NavItem to="/add-earnings">
          <FiPlus />
          <span>Dodaj obrót</span>
        </NavItem>

        <NavItem to="/monthly">
          <FiBarChart />
          <span>Podsumowanie</span>
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
      </NavList>
    </SidebarContainer>
  )
}

export default Sidebar
