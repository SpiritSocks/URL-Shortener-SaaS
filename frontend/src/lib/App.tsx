import { Button } from "@/components/ui/button";

import LandingCard from "@/shared/widgets/LandingCard/LandingCard";

import cards from "@/lib/cards";

const App = () => {

  return (
    <>
    <header className="h-20 w-full bg-white flex justify-between px-5">
        
      <div className="flex flex-row items-center justify-center gap-5">
        <div className="bg-[#849057]">icon</div>
        <h1 className="font-extrabold text-[42px] text-[#343b1b]">URL SHORTENER</h1>
      </div>

      <nav className="flex flex-row items-center justify-center gap-7 pr-5">
        <Button>Login</Button>
        <Button>Get started</Button>
      </nav>
    </header>
    <main>
      <section id="information" className="flex flex-col items-center">
        <div className="h-[25vh] w-[60vw] mt-5 flex flex-col">
          <span className="text-[46px] self-center text-center">Shorten Links, Track Performance, Grow Your Business</span>
          <p className=" text-[20px] self-center text-center mt-5">Create branded short links, generate QR codes, 
            and track every click with comprehensive analytics. Perfect for marketing 
            campaigns, social media, and print materials.
          </p>
        </div>
        <div className="flex flex-row gap-5">
          <Button>Start Free Trail</Button>
          <Button>Sign In</Button>
        </div>
        <div className="shadow_container">
          <div id="preview" className="bg-white w-[50vw] h-[25vh] border-3 border-[#c8d69b] flex flex-row items-center justify-around m-10 p-5 rounded-[15px] gap-5">
            <div className="w-[30%] h-[90%] bg-[#fbfcef] rounded-[15px]">
              
            </div>
            <div className="w-[30%] h-[90%] bg-[#fbfcef] rounded-[15px]">
              
            </div>
            <div className="w-[30%] h-[90%] bg-[#fbfcef] rounded-[15px]">
              
            </div>
          </div>
        </div>
      </section>

      <section id="cards" className="bg-white py-10">
        <div className="self-center flex flex-col gap-2 items-center mb-8">
          <h2 className="text-2xl font-bold">Everything you need to succeed</h2>
          <p className="text-gray-600">
            Powerful features designed for modern marketers and businesses
          </p>
        </div>

        <div
          className="
            grid grid-cols-3 gap-y-8 
            max-w-[1400px] mx-auto 
            place-items-center
          "
        >
          {cards.map((card, i) => (
            <LandingCard key={i} icon={card.icon} title={card.title} text={card.text} />
          ))}
        </div>
      </section>

      <section id="last_part" className="bg-[#f7f4ea]">
        <div className="flex items-center justify-evenly h-[120px] bg-[#343b1b] text-[#ebe6d2] text-lg font-medium">
          <p>10K+ Active Users</p>
          <p>500K+ Links Created</p>
          <p>5M+ Clicks Tracked</p>
        </div>

        <div className="max-w-6xl mx-auto px-10 py-16 flex gap-16">
          <article className="w-1/2">
            <h2 className="text-4xl font-bold mb-4">Built for Small Businesses</h2>
            <p className="text-gray-600 mb-10 leading-relaxed">
              ShortLink Pro is designed specifically for small businesses who need
              professional link management without the complexity or high costs of
              enterprise solutions.
            </p>

            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100">
                  <img src="dad" alt="" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Track Every Click</h3>
                  <p className="text-gray-600 text-sm">
                    Know exactly how many people are clicking your links and when they're doing it.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100">
                  <img src="dad" alt="" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">
                    Create short links in seconds. Our streamlined interface gets you what you need quickly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100">
                  <img src="dad" alt="" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Secure & Reliable</h3>
                  <p className="text-gray-600 text-sm">
                    Your links and data are protected with enterprise-grade security measures.
                  </p>
                </div>
              </div>
            </div>
          </article>

          <article className="w-1/2">
            <div className="bg-[#4c6fb1] text-white rounded-2xl p-10 h-full flex flex-col justify-center">
              <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-blue-100 mb-8">
                Join thousands of businesses using ShortLink Pro to track their marketing campaigns and grow their reach.
              </p>
              <button className="bg-white text-[#4c6fb1] font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-50 transition">
                Create Your Free Account →
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>
    <footer>

    </footer>
    </>
  )
}

export default App;