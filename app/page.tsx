import { getSession } from '@/lib/auth/helpers'
import { dashboardPath } from '@/lib/auth/helpers'
import { Role } from '@/lib/enums'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect(dashboardPath((session.user as any).role as Role))

  return (
    <main className="min-h-screen bg-brand-black text-white overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 bg-brand-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image src="/logo.jpg" alt="Faith Hoopers Camp" width={36} height={36}
            className="rounded-full grayscale invert opacity-90" />
          <span className="font-display font-bold text-base tracking-wide text-white uppercase">Faith Hoopers</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/register"
            className="text-sm font-bold bg-brand-orange text-white px-5 py-2 rounded-full hover:bg-court-600 transition-colors tracking-wide uppercase">
            Register
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-20">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Orange glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-orange/10 blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-orange/25 rounded-full blur-3xl scale-125" />
              <Image src="/logo.jpg" alt="Faith Hoopers Camp Logo"
                width={148} height={148}
                className="relative rounded-full border-4 border-white/10 grayscale invert"
                priority />
            </div>
          </div>

          <p className="font-mono text-brand-orange text-xs tracking-ultra uppercase mb-5 flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-brand-orange/60 inline-block" />
            Kigali, Rwanda
            <span className="w-8 h-px bg-brand-orange/60 inline-block" />
          </p>

          <h1 className="font-display font-black text-white uppercase leading-none mb-6">
            <span className="block text-6xl md:text-8xl lg:text-9xl tracking-tight">Faith</span>
            <span className="block text-6xl md:text-8xl lg:text-9xl tracking-tight text-brand-orange">Hoopers</span>
            <span className="block text-6xl md:text-8xl lg:text-9xl tracking-tight">Camp</span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-brand-orange/50" />
            <p className="font-mono text-xs text-white/50 tracking-widest uppercase">Where Faith Meets Basketball</p>
            <div className="h-px w-12 bg-brand-orange/50" />
          </div>

          <p className="text-white/60 text-lg max-w-lg mx-auto leading-relaxed mb-10">
            Redefining what it means to be a champion — on the court, and in Christ.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="font-display font-black text-sm uppercase tracking-widest bg-brand-orange text-white px-8 py-4 rounded-full hover:bg-court-600 transition-all hover:scale-105 active:scale-95">
              Join the Camp
            </Link>
            <Link href="#mission"
              className="font-display font-bold text-sm uppercase tracking-widest border border-white/20 text-white/70 px-8 py-4 rounded-full hover:border-white/50 hover:text-white transition-all">
              Our Story
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="font-mono text-xs text-white tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-white animate-pulse" />
        </div>
      </section>

      {/* ── ANCHOR VERSE ── */}
      <section className="bg-brand-orange py-16 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="font-mono text-white/60 text-xs tracking-ultra uppercase mb-5">Anchor Verse</p>
          <p className="font-display font-black text-2xl md:text-4xl text-white uppercase leading-tight mb-4">
            "I can do all this through him who gives me strength."
          </p>
          <p className="font-mono text-white/70 text-sm tracking-widest uppercase">— Philippians 4:13</p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-brand-coal py-10 px-6 md:px-12 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { number: '100+', label: 'Players Trained' },
            { number: '2+',   label: 'Seasons Running' },
            { number: '1',    label: 'God. One Vision.' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-black text-3xl md:text-5xl text-brand-orange">{stat.number}</p>
              <p className="font-mono text-xs text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section id="mission" className="bg-brand-black py-28 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-brand-orange text-xs tracking-ultra uppercase mb-4">Our Mission</p>
              <h2 className="font-display font-black text-5xl md:text-6xl uppercase leading-none text-white mb-8">
                Redefining<br />Influence<br /><span className="text-brand-orange">&amp; Stardom.</span>
              </h2>
              {/* Pull quote */}
              <div className="border-l-4 border-brand-orange pl-6 mb-8">
                <p className="text-white/90 text-xl italic leading-relaxed font-sans">
                  "How can I be a basketball player while staying rooted in Christ — without compromising who I am?"
                </p>
              </div>
              <p className="text-white/60 text-base leading-relaxed">
                That question is at the heart of everything we do. At Faith Hoopers Camp, we believe you don't have to choose between being elite on the court and being faithful to Christ. We exist to prove that the two not only coexist — they make each other stronger.
              </p>
            </div>

            <div className="space-y-5">
              {[
                {
                  num: '01',
                  title: 'Talent as Testimony',
                  body: 'Your skills are a gift from God. We help you sharpen them, own them, and use them as a platform — not for personal glory, but to point others to Christ.',
                },
                {
                  num: '02',
                  title: 'Influence With Integrity',
                  body: 'Real stardom isn\'t about Instagram followers or trophies. It\'s about the lives you change. We build athletes who lead by example, on and off the court.',
                },
                {
                  num: '03',
                  title: 'Rooted, Not Rigid',
                  body: 'Staying true to your faith doesn\'t make you less competitive — it makes you unshakeable. We train players whose identity is grounded in Christ, not in their stats.',
                },
              ].map((item) => (
                <div key={item.num} className="flex gap-5 bg-brand-coal rounded-2xl p-5 border border-white/5 hover:border-brand-orange/30 transition-colors group">
                  <span className="font-display font-black text-3xl text-brand-orange/30 group-hover:text-brand-orange/60 transition-colors shrink-0 leading-none mt-1">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-base uppercase text-white mb-1">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY / ABOUT ── */}
      <section className="bg-brand-cream text-brand-black py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Logo display */}
            <div className="flex justify-center order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-orange/15 rounded-3xl blur-3xl scale-110" />
                <div className="relative bg-brand-black rounded-3xl p-10 shadow-2xl">
                  <Image src="/logo.jpg" alt="Faith Hoopers Camp"
                    width={260} height={260}
                    className="grayscale invert opacity-90" />
                  <p className="font-mono text-xs text-white/40 tracking-widest uppercase text-center mt-4">
                    Where Faith Meets Basketball
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="font-mono text-brand-orange text-xs tracking-ultra uppercase mb-4">Who We Are</p>
              <h2 className="font-display font-black text-5xl md:text-6xl uppercase leading-none text-brand-black mb-6">
                More Than<br />a Camp.
              </h2>
              <div className="space-y-4 text-brand-grey text-base leading-relaxed">
                <p>
                  Faith Hoopers Camp is a basketball ministry in Kigali, Rwanda, built on the belief that the court is a classroom and every game is an opportunity to share the gospel.
                </p>
                <p>
                  We bring together young athletes for intensive training, mentorship, devotionals, and real community. We create a space where teens don't have to hide their faith to fit into sport — and don't have to leave their sport to grow in faith.
                </p>
                <p className="text-brand-black font-medium">
                  We share our talents. We lead others to Christ. We play for an audience of One.
                </p>
              </div>
              <a href="https://www.instagram.com/faith.hooperscamp/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-mono text-sm text-brand-orange hover:text-court-700 transition-colors uppercase tracking-widest mt-8">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow @faith.hooperscamp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER ── */}
      <section className="bg-brand-black py-28 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-mono text-brand-orange text-xs tracking-ultra uppercase mb-4">The Founder</p>
              <h2 className="font-display font-black text-5xl md:text-6xl uppercase leading-none text-white mb-6">
                Built on<br /><span className="text-brand-orange">Purpose.</span>
              </h2>
              <div className="space-y-4 text-white/60 text-base leading-relaxed">
                <p>
                  Joshua Kacyira founded Faith Hoopers Camp with a single conviction — that basketball courts in Rwanda could become places of genuine spiritual transformation.
                </p>
                <p>
                  Growing up with a deep love for the game and his faith, Joshua kept asking the question that nobody around him seemed to be answering: <span className="text-white/90 italic">how do you compete at the highest level without losing who you are in Christ?</span>
                </p>
                <p>
                  He decided to stop waiting for an answer and start building one. What began as a small group of players gathering in Kigali has grown into a full camp programme — intensive basketball training woven together with Bible study, devotionals, and a community that holds each other accountable.
                </p>
                <p className="text-white/90 font-medium">
                  Joshua's vision is bold and simple: raise a generation of Rwandan athletes who are elite on the court, uncompromising in their faith, and who lead others to Christ through the way they play the game.
                </p>
              </div>
            </div>

            {/* Founder card */}
            <div className="flex justify-center md:justify-end">
              <div className="bg-brand-coal rounded-3xl p-8 border border-white/5 max-w-sm w-full relative">
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full border-4 border-brand-orange/40 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-orange/60" />
                </div>

                <div className="w-20 h-20 rounded-2xl bg-brand-orange flex items-center justify-center mb-6 shadow-lg">
                  <span className="font-display font-black text-3xl text-white">JK</span>
                </div>

                <p className="font-mono text-brand-orange text-xs tracking-ultra uppercase mb-1">Founder &amp; Director</p>
                <h3 className="font-display font-black text-3xl text-white uppercase leading-tight mb-1">Joshua</h3>
                <h3 className="font-display font-black text-3xl text-brand-orange uppercase leading-tight mb-6">Kacyira</h3>

                <blockquote className="border-l-2 border-brand-orange pl-4 text-white/60 italic text-sm leading-relaxed">
                  "Basketball is our language. Faith is our foundation. Together, they build young men and women who stand for something greater than the game."
                </blockquote>

                <div className="mt-6 pt-5 border-t border-white/5">
                  <a href="https://www.instagram.com/faith.hooperscamp/" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-white/40 hover:text-brand-orange transition-colors text-xs font-mono tracking-widest uppercase">
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    @faith.hooperscamp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE DO ── */}
      <section className="bg-brand-cream text-brand-black py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-brand-orange text-xs tracking-ultra uppercase mb-4">The Programme</p>
            <h2 className="font-display font-black text-5xl md:text-6xl uppercase leading-none text-brand-black">
              What We Do
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '🏀', title: 'Skills Training',    body: 'Professional coaching in fundamentals, footwork, shooting mechanics, and team play. Every session is designed to elevate your game.' },
              { icon: '✝️', title: 'Bible Sessions',     body: 'Weekly devotionals and group Bible study connecting Scripture to the discipline and character required on the court.' },
              { icon: '🏆', title: 'Competitive Games',  body: 'Intra-camp scrimmages and organised competition — putting skills and character to the test in a supported environment.' },
              { icon: '🙏', title: 'Mentorship',         body: 'Coaches who invest in the whole player. One-on-one conversations, accountability, and spiritual direction beyond just the game.' },
              { icon: '👥', title: 'Community',          body: 'A tight-knit family of athletes from across Rwanda who encourage, challenge, and pray for one another throughout the programme.' },
              { icon: '📱', title: 'Camp Platform',      body: 'Stay organised with schedules, attendance tracking, devotionals, and team announcements — all in one place for everyone.' },
            ].map((item) => (
              <div key={item.title}
                className="bg-white rounded-2xl p-6 border border-brand-silver/20 hover:border-brand-orange/40 hover:shadow-lg transition-all group cursor-default">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-bold text-base uppercase tracking-wide text-brand-black mb-2 group-hover:text-brand-orange transition-colors">
                  {item.title}
                </h3>
                <p className="text-brand-grey text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECOND VERSE ── */}
      <section className="bg-brand-black py-20 px-6 md:px-12 text-center border-y border-white/5">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-white/30 text-xs tracking-ultra uppercase mb-6">Live by this</p>
          <p className="font-display font-black text-2xl md:text-4xl text-white uppercase leading-tight mb-4">
            "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."
          </p>
          <p className="font-mono text-brand-orange text-sm tracking-widest uppercase">— Colossians 3:23</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-brand-orange py-28 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <Image src="/logo.jpg" alt="Faith Hoopers" width={80} height={80}
            className="mx-auto mb-8 rounded-full grayscale invert opacity-80" />
          <h2 className="font-display font-black text-5xl md:text-7xl uppercase leading-none text-white mb-6">
            Ready to<br />Play?
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed">
            Join Faith Hoopers Camp — where your talent becomes a testimony and your game becomes a ministry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"
              className="font-display font-black text-base uppercase tracking-widest bg-brand-black text-white px-10 py-5 rounded-full hover:bg-brand-coal transition-all hover:scale-105 active:scale-95">
              Register Now
            </Link>
            <Link href="/login"
              className="font-display font-bold text-base uppercase tracking-widest border-2 border-white/40 text-white px-10 py-5 rounded-full hover:border-white hover:bg-white/10 transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-coal text-white/30 py-10 px-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.jpg" alt="Faith Hoopers" width={28} height={28}
              className="rounded-full grayscale invert opacity-50" />
            <span className="font-mono text-xs tracking-widest uppercase">Faith Hoopers Camp · Kigali, Rwanda</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs tracking-widest uppercase">
            <a href="https://www.instagram.com/faith.hooperscamp/" target="_blank" rel="noopener noreferrer"
              className="hover:text-brand-orange transition-colors">Instagram</a>
            <Link href="/login"    className="hover:text-brand-orange transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-brand-orange transition-colors">Register</Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto pt-6 border-t border-white/5 text-center">
          <p className="font-mono text-xs">© {new Date().getFullYear()} Faith Hoopers Camp · Where Faith Meets Basketball</p>
        </div>
      </footer>

    </main>
  )
}
