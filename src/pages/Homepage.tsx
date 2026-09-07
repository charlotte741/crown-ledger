import AboutUs from "./Aboutus"
import BusinessBanking from "./Businessbanking"
import CardsSection from "./Cardsection"
import ContactSection from "./Contactsection"
import Hero from "./Hero"
import Investments from "./Investments"
import PersonalBanking from "./Personalbanking"

// Height of the fixed header on desktop/mobile — used so scrollIntoView
// doesn't tuck section tops under the AppBar.
const sectionStyle: React.CSSProperties = { scrollMarginTop: 88 }

const Homepage = () => {
  return (
    <div>
      <div id="home" style={sectionStyle}>
        <Hero />
      </div>
      <div id="about" style={sectionStyle}>
        <AboutUs />
      </div>
      <div id="personal-banking" style={sectionStyle}>
        <PersonalBanking />
      </div>
      <div id="business-banking" style={sectionStyle}>
        <BusinessBanking />
      </div>
      <div id="investments" style={sectionStyle}>
        <Investments />
      </div>
      <div id="cards" style={sectionStyle}>
        <CardsSection />
      </div>
      <div id="contact" style={sectionStyle}>
        <ContactSection />
      </div>
    </div>
  )
}

export default Homepage