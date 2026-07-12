import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Collections from './components/Collections'
import Story from './components/Story'
import Featured from './components/Featured'
import Testimonials from './components/Testimonials'
import Newsletter from './components/Newsletter'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Collections />
        <Story />
        <Featured />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
