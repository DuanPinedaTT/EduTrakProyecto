import { useState } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import NavegacionDashboard from '../navegacion/NavegacionDashboard'
import Footer from './Footer'

const LayoutDashboard = ({ children }) => {
  const [sidebarAbierto, setSidebarAbierto] = useState(true)

  const alternarSidebar = () => {
    setSidebarAbierto(!sidebarAbierto)
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        <Row className="g-0">
          <Col 
            xs={sidebarAbierto ? 12 : 0} 
            md={sidebarAbierto ? 3 : 0} 
            lg={sidebarAbierto ? 2 : 0}
            className="sidebar-col"
          >
            <NavegacionDashboard 
              abierto={sidebarAbierto} 
              alternar={alternarSidebar} 
            />
          </Col>
          <Col 
            xs={12} 
            md={sidebarAbierto ? 9 : 12} 
            lg={sidebarAbierto ? 10 : 12}
          >
            <div className="contenido-principal">
              <button 
                className="btn btn-primary btn-sm m-3 d-md-none"
                onClick={alternarSidebar}
              >
                ☰ Menú
              </button>
              <Container fluid className="p-4">
                {children}
              </Container>
            </div>
          </Col>
        </Row>
      </div>
      <Footer />
    </div>
  )
}

export default LayoutDashboard
