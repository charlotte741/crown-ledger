import { Header, Footer } from "../static"
import { Outlet } from "react-router-dom"
import ScrollToTop from "../../utils/ScrollToTop"

const Homelayout = () => {
  return (
    <>
        <ScrollToTop />
        <Header />
        <Outlet />
        <Footer />
    </>
  )
}

export default Homelayout