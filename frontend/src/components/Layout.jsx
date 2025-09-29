import React from 'react'
import styled from 'styled-components'
import Header from './Header'
import Navigation from './Navigation'

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Main = styled.main`
  flex: 1;
  padding-top: 80px; /* Space for fixed header */
  padding-bottom: 80px; /* Space for fixed navigation */
  background: ${({ theme }) => theme.colors.background};
`

const Content = styled.div`
  max-width: 428px;
  margin: 0 auto;
  min-height: calc(100vh - 160px); /* Full height minus header and nav */
`

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Header />
      <Main>
        <Content>
          {children}
        </Content>
      </Main>
      <Navigation />
    </LayoutContainer>
  )
}

export default Layout