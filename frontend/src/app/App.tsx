import { Button } from "@/components/ui/button";

import { QrCode, MousePointerClick, Zap, Shield, Link2 } from 'lucide-react';

import LandingCard from "@/shared/widgets/LandingCard/LandingCard";

import cards from "@/lib/cards";

import { useNavigate } from "react-router-dom";

const App = () => {

  const navigate = useNavigate();

  const handleLoginRegistration = () => {
    navigate('/login');
  }

  return (
    <>
    <header className="w-full bg-white flex flex-wrap items-center justify-between py-3 px-4 md:py-4 md:px-8">
      <div className="flex items-center gap-3">
        <div className="size-10 flex items-center justify-center">
          <Link2 size={100} color="#3971b8"/>
        </div>
        <h1 className="font-bold text-lg md:text-[42px] text-[#343b1b]">Url Shortener</h1>
      </div>

      <nav className="flex items-center gap-3 md:gap-7 mt-3 md:mt-0">
        <Button onClick={handleLoginRegistration} className="w-[120px]">Login</Button>
        <Button onClick={handleLoginRegistration} className="w-[120px]">Get started</Button>
      </nav>
    </header>
    <main>
      <section id="information" className="flex flex-col items-center px-4 md:px-0">
        <div className="w-full max-w-5xl mt-5 flex flex-col md:h-[25vh]">
          <span className="text-2xl text-[#343b1b] md:text-[46px] self-center text-center font-bold ">Shorten Links, Track Performance, Grow Your Business</span>
          <p className="text-base md:text-[20px] self-center text-center mt-4 md:mt-5">Create branded short links, generate QR codes, and track every click with comprehensive analytics. Perfect for marketing campaigns, social media, and print materials.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={handleLoginRegistration}>Start Free Trial</Button>
          <Button onClick={handleLoginRegistration}>Sign In</Button>
        </div>

        <div className="shadow_container w-full flex justify-center">
          <div id="preview" className="bg-white border-3 border-[#c8d69b] flex flex-col md:flex-row items-center md:items-stretch justify-around m-4 md:m-10 p-4 md:p-5 rounded-[15px] gap-4 md:gap-5 w-full max-w-4xl">
            <div className="w-full md:w-1/3 h-auto md:h-40 bg-[#fbfcef] rounded-[15px] p-3 flex flex-col items-center justify-center text-center">
              <h2 className="text-lg md:text-xl">Original Url</h2>
              <p className="text-gray-400 truncate max-w-full">https://exampleUrl.com/very-long-url...</p>
              <h2 className="mt-3 text-lg md:text-xl">Short Url</h2>
              <p className="text-[#4c6fb1] font-bold">short.link/abc123</p>
            </div>

            <div className="w-full md:w-1/3 h-auto md:h-40 bg-[#fbfcef] rounded-[15px] p-3 flex flex-col items-center justify-center relative">
              <p className="text-3xl md:text-4xl font-semibold text-[#4c6fb1]">2547</p>
              <p>Total Clicks</p>
            </div>

            <div className="w-full md:w-1/3 h-auto md:h-40 bg-[#fbfcef] rounded-[15px] flex items-center justify-center">
              <QrCode size={100} color="#4c6fb1" />
            </div>
          </div>
        </div>
      </section>

      <section id="cards" className="bg-white py-10">
        <div className="self-center flex flex-col gap-2 items-center mb-8 px-4">
          <h2 className="text-[42px] sm:text-2xl font-bold">Everything you need to succeed</h2>
          <p className="text-gray-600 text-sm sm:text-base text-center max-w-2xl">
            Powerful features designed for modern marketers and businesses
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-[1400px] mx-auto place-items-stretch px-4">
          {cards.map((card, i) => (
            <div key={i} className="w-full flex justify-center">
              <LandingCard icon={card.icon} title={card.title} text={card.text} />
            </div>
          ))}
        </div>
      </section>

      <section id="last_part" className="bg-[#f7f4ea]">
        <div className="flex flex-col sm:flex-row items-center justify-evenly gap-4 py-6 sm:h-[120px] bg-[#343b1b] text-[#ebe6d2] text-sm sm:text-lg font-medium px-4">
          <p>10K+ Active Users</p>
          <p>500K+ Links Created</p>
          <p>5M+ Clicks Tracked</p>
        </div>

        <div className="flex flex-col md:flex-row px-4 sm:px-8 md:px-16 py-8 md:py-20 gap-8 md:gap-16">
          <article className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Built for Small Businesses</h2>
            <p className="text-gray-600 mb-10 leading-relaxed text-[16px]">
              ShortLink Pro is designed specifically for small businesses who need
              professional link management without the complexity or high costs of
              enterprise solutions.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                  <MousePointerClick color="white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Track Every Click</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-[16px]">
                    Know exactly how many people are clicking your links and when they're doing it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                  <Zap color="white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-[16px]">
                    Create short links in seconds. Our streamlined interface gets you what you need quickly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                  <Shield color="white"/>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Secure & Reliable</h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-[16px]">
                    Your links and data are protected with enterprise-grade security measures.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="w-full md:w-1/2">
            <div className="bg-[#4c6fb1] text-white rounded-2xl p-6 md:p-10 h-full flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-blue-100 mb-8">
                Join thousands of businesses using ShortLink Pro to track their marketing campaigns and grow their reach.
              </p>
              <button className="bg-white text-[#4c6fb1] font-semibold py-3 px-6 rounded-lg flex 
              items-center justify-center gap-2 hover:bg-blue-50 transition w-full"
              onClick={handleLoginRegistration}>
                Create Your Free Account →
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
    <footer className="flex flex-row items-center h-[120px] bg-[#343b1b] text-[#ebe6d2] px-5">
      <h2 className="font-bold text-[42px] text-[#f7f4ea]">Url Shortener</h2>
    </footer>
    </>
  )
}

export default App;