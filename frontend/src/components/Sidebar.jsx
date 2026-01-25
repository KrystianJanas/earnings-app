import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHome, FiPlus, FiBarChart, FiSettings, FiUsers, FiChevronDown, FiLogOut, FiUserCheck, FiCheck, FiScissors } from 'react-icons/fi'
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
    padding: ${({ theme }) => theme.spacing.lg};
    z-index: 100;
  `}
`

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.colors.gradient.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 1.25rem;
    color: white;
  }
`

const LogoText = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.text.muted};
    font-weight: 500;
  }
`

const CompanySelector = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  position: relative;
`

const CompanyButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const CompanyInfo = styled.div`
  text-align: left;
  flex: 1;
  min-width: 0;
`

const CompanyName = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CompanyRole = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.muted};
`

const ChevronIcon = styled(FiChevronDown)`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => $isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  flex-shrink: 0;
`

const Dropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  z-index: 1000;
`

const DropdownSection = styled.div`
  padding: 8px 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  text-align: left;
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.surface};
  }

  svg {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`

const CompanyMenuItem = styled(DropdownItem)`
  justify-content: space-between;
`

const CompanyMenuInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const ActiveIndicator = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    font-size: 0.85rem;
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
  flex: 1;
`

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:last-child {
    margin-top: auto;
    margin-bottom: 0;
  }
`

const NavSectionTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm};
`

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: all ${({ theme }) => theme.transitions.normal};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 500;
  font-size: 0.9rem;

  &.active {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  &:hover:not(.active) {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  svg {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.text.muted};
    transition: color ${({ theme }) => theme.transitions.normal};
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
        <LogoIcon>
          <FiScissors />
        </LogoIcon>
        <LogoText>
          <h1>Salon Manager</h1>
          <p>Aplikacja do zarządzania salonem</p>
        </LogoText>
      </Logo>

      <CompanySelector>
        <CompanyButton onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <CompanyInfo>
            <CompanyName>{currentCompany.name}</CompanyName>
            <CompanyRole>{getRoleLabel(currentCompany.userRole)}</CompanyRole>
          </CompanyInfo>
          <ChevronIcon $isOpen={isDropdownOpen} />
        </CompanyButton>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <Overlay onClick={() => setIsDropdownOpen(false)} />
              <Dropdown
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {companies.length > 1 && (
                  <DropdownSection>
                    {companies.map((company) => (
                      <CompanyMenuItem
                        key={company.id}
                        onClick={() => handleCompanySwitch(company.id)}
                      >
                        <CompanyMenuInfo>
                          <CompanyName>{company.name}</CompanyName>
                          <CompanyRole>{getRoleLabel(company.userRole)}</CompanyRole>
                        </CompanyMenuInfo>
                        {company.id === currentCompany.id && (
                          <ActiveIndicator>
                            <FiCheck />
                          </ActiveIndicator>
                        )}
                      </CompanyMenuItem>
                    ))}
                  </DropdownSection>
                )}
                <DropdownSection>
                  <DropdownItem onClick={() => {
                    setShowCreateCompany(true)
                    setIsDropdownOpen(false)
                  }}>
                    <FiPlus />
                    Utwórz nowy salon
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection>
                  <DropdownItem onClick={handleLogout}>
                    <FiLogOut />
                    Wyloguj się
                  </DropdownItem>
                </DropdownSection>
              </Dropdown>
            </>
          )}
        </AnimatePresence>
      </CompanySelector>

      <NavList>
        <NavSection>
          <NavItem to="/" end>
            <FiHome />
            <span>Strona główna</span>
          </NavItem>
        </NavSection>

        <NavSection>
          <NavSectionTitle>Zarządzanie</NavSectionTitle>
          <NavItem to="/add-earnings">
            <FiPlus />
            <span>Dodaj obrót</span>
          </NavItem>

          <NavItem to="/monthly">
            <FiBarChart />
            <span>Podsumowanie</span>
          </NavItem>

          <NavItem to="/clients">
            <FiUserCheck />
            <span>Klienci</span>
          </NavItem>
        </NavSection>

        {isOwner && (
          <NavSection>
            <NavSectionTitle>Admin</NavSectionTitle>
            <NavItem to="/employees">
              <FiUsers />
              <span>Pracownicy</span>
            </NavItem>
          </NavSection>
        )}

        <NavSection>
          <NavItem to="/settings">
            <FiSettings />
            <span>Ustawienia</span>
          </NavItem>
        </NavSection>
      </NavList>
    </SidebarContainer>
  )
}

export default Sidebar
