import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDownLeft, ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Check,
  CheckCircle2, ChevronRight, CircleHelp, CreditCard, Heart,
  Home as HomeIcon, Mail, MessageCircle, ShieldCheck, Sparkles, UserRound,
  Wallet as WalletIcon, LogOut, type LucideIcon, Menu, Search, Bell, X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ForgotPassword, Login, Register, type DemoProfile } from '@/components/auth-gate';

const queryClient = new QueryClient();
const DemoSessionContext = createContext<{ logout: () => void }>({ logout: () => undefined });

type Section = { title: string; href: string; art: string; };
const sections: Section[] = [
  { title: 'Identity', href: '/identity', art: '/gvan-art/identity.png' },
  { title: 'How to Use', href: '/how-to-use', art: '/gvan-art/how-to-use.png' },
  { title: 'Rules', href: '/rules', art: '/gvan-art/rules.png' },
  { title: 'Weekly Challenge', href: '/weekly-challenge', art: '/gvan-art/weekly-challenge.png' },
  { title: 'Wallet', href: '/wallet', art: '/gvan-art/wallet.png' },
  { title: 'Contact Us', href: '/contact-us', art: '/gvan-art/contact-us.png' },
];

function Topbar() {
  const { logout } = useContext(DemoSessionContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const matches = sections.filter(({ title }) => title.toLowerCase().includes(query.trim().toLowerCase()));
  return <header className="topbar">
    <button type="button" className="utility-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false); setNoticeOpen(false); }} data-testid="button-menu">
      {menuOpen ? <X /> : <Menu />}
    </button>
    <Link href="/" className="brand-mark" aria-label="Gvan home" data-testid="link-brand-home">Gvan<span className="brand-heart">♥</span></Link>
    <div className="topbar-actions">
      <button type="button" className="utility-button" aria-label="Search sections" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false); setNoticeOpen(false); }} data-testid="button-search"><Search /></button>
      <button type="button" className="utility-button" aria-label="Notifications" aria-expanded={noticeOpen} onClick={() => { setNoticeOpen(!noticeOpen); setMenuOpen(false); setSearchOpen(false); }} data-testid="button-notifications"><Bell /><span className="notification-dot" /></button>
    </div>
    {menuOpen && <div className="header-popover menu-popover" data-testid="panel-menu">
      <p className="popover-heading">Your Gvan space</p>
      {sections.map(section => <Link key={section.href} href={section.href} onClick={() => setMenuOpen(false)} data-testid={`menu-link-${section.href.slice(1)}`}>{section.title}<ChevronRight size={16} /></Link>)}
      <button type="button" className="menu-logout" onClick={logout} data-testid="button-logout"><LogOut size={16} /> Log out</button>
    </div>}
    {searchOpen && <div className="header-popover search-popover" data-testid="panel-search">
      <label htmlFor="dashboard-search">Find a section</label>
      <div className="search-field-wrap"><Search size={17} /><input id="dashboard-search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Try “wallet”" data-testid="input-search-sections" /></div>
      <div className="search-results">{matches.length ? matches.map(section => <Link key={section.href} href={section.href} onClick={() => { setSearchOpen(false); setQuery(''); }} data-testid={`search-result-${section.href.slice(1)}`}>{section.title}<ArrowRight size={15} /></Link>) : <p>No matching sections yet.</p>}</div>
    </div>}
    {noticeOpen && <div className="header-popover notice-popover" data-testid="panel-notifications"><span className="notice-heart">♥</span><div><strong>All caught up</strong><p>Your Gvan updates will appear here.</p></div></div>}
  </header>;
}

function BottomNav() {
  const [location] = useLocation();
  const nav = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/weekly-challenge', label: 'Challenge', icon: Sparkles },
    { href: '/wallet', label: 'Wallet', icon: WalletIcon },
    { href: '/identity', label: 'Profile', icon: UserRound },
  ];
  return <nav className="bottom-nav" aria-label="Primary navigation" data-testid="navigation-primary">
    <div className="nav-inner">{nav.map(({ href, label, icon: Icon }) =>
      <Link key={href} href={href} className="nav-item" aria-current={location === href ? 'page' : undefined} data-testid={`link-nav-${label.toLowerCase()}`}>
        <Icon aria-hidden="true" /><span>{label}</span>
      </Link>)}</div>
  </nav>;
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="app-shell">
    <div className="app-width">
      <Topbar />
      <main className="fade-in">{children}</main>
    </div>
    <BottomNav />
  </div>;
}

function PageIntro({ kicker, title, description, icon: Icon }: { kicker: string; title: string; description: string; icon: LucideIcon }) {
  return <div className="mb-7">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#d6b6d6] hover:text-white" data-testid="link-back-home"><ArrowLeft size={16} /> Back to home</Link>
    <div className="mb-3 flex items-center gap-2 text-[#ff8bdc]"><Icon size={16} /><span className="eyebrow">{kicker}</span></div>
    <h1 className="page-title">{title}</h1>
    <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{description}</p>
  </div>;
}

function Home() {
  return <Shell>
    <div className="dashboard-heading"><p>YOUR SPACE, YOUR PACE</p><span aria-hidden="true">♥</span></div>
    <div className="grid grid-cols-2 gap-[10px] sm:gap-3" data-testid="grid-sections">
      {sections.map(({ title, href, art }) =>
        <Link key={href} href={href} className="art-card" aria-label={title} data-testid={`card-section-${href.slice(1)}`}>
          <img src={art} alt={title} loading="eager" data-testid={`image-section-${href.slice(1)}`} />
        </Link>)}
    </div>
  </Shell>;
}

function Identity() {
  return <Shell><PageIntro kicker="A little about you" title="Your identity" description="A demo profile for your Gvan space. Keep it personal, keep it yours." icon={UserRound} />
    <section className="glass-card glow-card p-5 sm:p-7" data-testid="card-profile">
      <div className="flex items-center gap-4 border-b border-white/10 pb-5">
        <div className="grid h-[62px] w-[62px] place-items-center rounded-[21px] border border-[#ff9cde]/45 bg-[linear-gradient(145deg,#d957b6,#714cc3)] font-[var(--app-font-serif)] text-2xl font-extrabold shadow-[0_8px_24px_rgba(214,64,176,.25)]" data-testid="text-profile-initials">AR</div>
        <div><div className="flex items-center gap-1.5"><h2 className="text-lg font-bold" data-testid="text-profile-name">Alex Rivera</h2><BadgeCheck size={16} className="text-[#ffa6df]" /></div><p className="mt-1 text-xs text-muted">Member since October 2024</p></div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-5">
        <div><p className="eyebrow">Display name</p><p className="mt-2 text-sm font-semibold">Alex Rivera</p></div>
        <div><p className="eyebrow">Member type</p><p className="mt-2 text-sm font-semibold">Community member</p></div>
        <div><p className="eyebrow">Home base</p><p className="mt-2 text-sm font-semibold">Portland, OR</p></div>
        <div><p className="eyebrow">Profile status</p><p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ffa8df]"><CheckCircle2 size={15} /> Looking good</p></div>
      </div>
    </section>
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[.035] p-4 text-xs leading-5 text-muted" data-testid="text-profile-demo-note">This profile is a demo preview. Your details stay on this device only.</div>
  </Shell>;
}

function HowToUse() {
  const tips = [
    ['01', 'Find your way', 'Use the six shortcuts on home to jump straight into the section you need.'],
    ['02', 'Make it a ritual', 'Drop by the weekly challenge for one thoughtful, low-pressure prompt.'],
    ['03', 'Keep it simple', 'Your demo profile and wallet are examples. Nothing here connects to a real account.'],
  ];
  return <Shell><PageIntro kicker="The little guide" title="How to use Gvan" description="No big learning curve. Just a few helpful places to start." icon={BookOpen} />
    <div className="space-y-3">{tips.map(([number, title, copy]) => <article key={number} className="glass-card flex gap-4 p-5" data-testid={`card-guide-step-${number}`}>
      <div className="font-[var(--app-font-serif)] text-xl font-extrabold text-[#ff8edc]">{number}</div><div><h2 className="font-bold">{title}</h2><p className="mt-1.5 text-sm leading-6 text-muted">{copy}</p></div>
    </article>)}</div>
    <div className="glass-card glow-card mt-5 flex items-start gap-3 p-5" data-testid="card-guide-note"><CircleHelp size={19} className="mt-0.5 shrink-0 text-[#efa0df]" /><p className="text-sm leading-6 text-[#e8d7ec]">Everything in this preview is local and for demonstration. Explore freely; no changes leave your browser.</p></div>
    <Link href="/contact-us" className="primary-button mt-6 w-full sm:w-auto" data-testid="link-guide-contact">Still curious? Contact us <ArrowRight size={16} /></Link>
  </Shell>;
}

function Rules() {
  const rules = [
    ['Lead with kindness', 'Talk to people as people. Be thoughtful, even when you see things differently.'],
    ['Respect boundaries', 'Ask before sharing someone else’s story, details, or images. No means no.'],
    ['Keep it honest', 'Be yourself. Don’t impersonate other members or mislead the community.'],
    ['Protect the space', 'No harassment, hate, threats, or unwanted promotional messages.'],
  ];
  return <Shell><PageIntro kicker="The good-neighbor guide" title="Community rules" description="A few shared promises help make this a softer, safer place for everyone." icon={ShieldCheck} />
    <div className="space-y-3">{rules.map(([title, copy], i) => <article key={title} className="glass-card flex gap-4 p-5" data-testid={`card-rule-${i + 1}`}>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#ff9ee0]/30 bg-[#ed70c4]/10 text-[#ffb4e7]"><Check size={16} /></div>
      <div><h2 className="font-bold">{title}</h2><p className="mt-1.5 text-sm leading-6 text-muted">{copy}</p></div>
    </article>)}</div>
    <p className="mt-5 text-center text-xs text-[#bca8c4]" data-testid="text-rules-footer">Care makes the community. Thank you for being here.</p>
  </Shell>;
}

function WeeklyChallenge() {
  const [complete, setComplete] = useState(() => localStorage.getItem('gvan-challenge-done') === 'yes');
  const toggle = () => {
    const next = !complete;
    setComplete(next);
    localStorage.setItem('gvan-challenge-done', next ? 'yes' : 'no');
  };
  return <Shell><PageIntro kicker="Week 24 · a little intention" title="Make room for joy." description="A gentle nudge to notice what gives you energy, then make a little more space for it." icon={Sparkles} />
    <section className="glass-card glow-card overflow-hidden p-6 sm:p-8" data-testid="card-weekly-challenge">
      <div className="mb-6 flex items-center justify-between"><span className="rounded-full border border-[#ff9fe0]/30 bg-[#e968c3]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.13em] text-[#ffafe6]">This week</span><Heart size={20} className="text-[#ff99df]" /></div>
      <h2 className="max-w-md font-[var(--app-font-serif)] text-3xl font-extrabold leading-tight tracking-[-.8px]">Name one thing that made you feel like yourself.</h2>
      <p className="mt-4 max-w-lg text-sm leading-6 text-muted">It could be a song, a quiet walk, a favorite meal, or a moment with someone you love. Take a minute to notice it.</p>
      <div className="my-6 rounded-2xl border border-white/10 bg-[#1e1229]/60 p-4"><p className="eyebrow mb-2">A thought to take with you</p><p className="text-sm italic leading-6 text-[#f0d9ed]">“Joy doesn’t have to be big to be worth making room for.”</p></div>
      <button onClick={toggle} className={complete ? 'secondary-button w-full' : 'primary-button w-full'} aria-pressed={complete} data-testid="button-toggle-challenge">
        {complete ? <><CheckCircle2 size={18} /> Challenge complete — undo</> : <><Heart size={17} /> I made a little room</>}
      </button>
      <p className="mt-3 text-center text-xs text-muted" role="status" data-testid="status-challenge">{complete ? 'Beautifully done. Your progress is saved on this device.' : 'A small moment counts. Mark complete whenever you’re ready.'}</p>
    </section>
  </Shell>;
}

function Wallet() {
  return <Shell><PageIntro kicker="Your wallet" title="A demo, not a checkout." description="This sample view is here to show how your wallet might look. It has no payment features." icon={WalletIcon} />
    <div className="rounded-[26px] border border-[#f292dc]/50 bg-[linear-gradient(130deg,#a445a1,#7046ae_58%,#503a92)] p-6 shadow-[0_16px_40px_rgba(134,51,153,.2)] sm:p-7" data-testid="card-demo-balance">
      <div className="flex items-center justify-between"><span className="eyebrow text-[#ffe0f5]">Demo balance</span><CreditCard size={20} className="text-[#ffd4f2]" /></div>
      <div className="mt-5 flex items-baseline gap-2"><span className="font-[var(--app-font-serif)] text-[43px] font-extrabold tracking-[-1.8px]" data-testid="text-demo-balance">$28.50</span><span className="text-sm text-white/75">sample credits</span></div>
      <div className="mt-5 flex items-center gap-2 border-t border-white/20 pt-4 text-xs text-[#f5dff2]"><ShieldCheck size={14} /> Demo only · no funds stored</div>
    </div>
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between"><h2 className="font-[var(--app-font-serif)] text-xl font-bold">Recent activity</h2><span className="text-xs text-muted">Example history</span></div>
      <div className="glass-card divide-y divide-white/[.08]" data-testid="list-demo-history">
        {[{title:'Welcome credits', date:'Jun 12, 2025', amount:'+ 20.00', icon:Heart},{title:'Community thank-you',date:'Jun 08, 2025',amount:'+ 8.50',icon:ArrowDownLeft}].map((item, i) => {
          const Icon = item.icon;
          return <div key={item.title} className="flex items-center gap-3 p-4" data-testid={`row-wallet-history-${i + 1}`}>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#ed72c7]/10 text-[#ff9cde]"><Icon size={17} /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted">{item.date}</p></div><span className="text-sm font-bold text-[#f5b5e6]">{item.amount}</span>
          </div>;
        })}
      </div>
    </section>
    <p className="mt-4 text-center text-xs leading-5 text-[#bca8c4]" data-testid="text-wallet-disclaimer">No deposits, purchases, transfers, or payment actions are available in this demo.</p>
  </Shell>;
}

function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = 'Please enter at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (message.trim().length < 10) next.message = 'Please write at least 10 characters.';
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };
  return <Shell><PageIntro kicker="A real human-ish demo" title="We’re listening." description="Share a thought, ask a question, or say hello. This form shows a local confirmation only." icon={MessageCircle} />
    {sent ? <section className="glass-card glow-card p-6 text-center sm:p-8" role="status" data-testid="status-contact-confirmation">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#eb75c7]/15 text-[#ff9ce0]"><CheckCircle2 size={28} /></div>
      <h2 className="font-[var(--app-font-serif)] text-2xl font-extrabold">Message received here.</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">Thanks, {name.trim()}. This is only a local demo confirmation; nothing was sent.</p>
      <button type="button" className="secondary-button mt-6" onClick={() => { setSent(false); setName(''); setEmail(''); setMessage(''); }} data-testid="button-send-another">Write another message</button>
    </section> : <form onSubmit={submit} noValidate className="glass-card glow-card space-y-5 p-5 sm:p-7" data-testid="form-contact">
      <div><label htmlFor="contact-name" className="mb-2 block text-sm font-semibold">Your name</label><input id="contact-name" className="field" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Rivera" autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'error-name' : undefined} data-testid="input-contact-name" />{errors.name && <p id="error-name" className="mt-1.5 text-xs text-[#ff9cae]" data-testid="error-contact-name">{errors.name}</p>}</div>
      <div><label htmlFor="contact-email" className="mb-2 block text-sm font-semibold">Email address</label><input id="contact-email" type="email" className="field" value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@example.com" autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'error-email' : undefined} data-testid="input-contact-email" />{errors.email && <p id="error-email" className="mt-1.5 text-xs text-[#ff9cae]" data-testid="error-contact-email">{errors.email}</p>}</div>
      <div><label htmlFor="contact-message" className="mb-2 block text-sm font-semibold">Your message</label><textarea id="contact-message" rows={5} className="field resize-y" value={message} onChange={e => setMessage(e.target.value)} placeholder="What’s on your mind?" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'error-message' : undefined} data-testid="input-contact-message" />{errors.message && <p id="error-message" className="mt-1.5 text-xs text-[#ff9cae]" data-testid="error-contact-message">{errors.message}</p>}</div>
      <p className="text-xs leading-5 text-muted">Demo form only. Your message is not sent or saved anywhere.</p>
      <button type="submit" className="primary-button w-full" data-testid="button-submit-contact"><Mail size={17} /> Show local confirmation</button>
    </form>}
    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#bca8c4]"><Heart size={13} className="text-[#ff8cda]" /> Made for a more thoughtful community</div>
  </Shell>;
}

function Router() {
  const [location, setLocation] = useLocation();
  const [profile, setProfile] = useState<DemoProfile | null>(() => {
    try {
      const stored = localStorage.getItem('gvan-demo-session');
      return stored ? JSON.parse(stored) as DemoProfile : null;
    } catch {
      localStorage.removeItem('gvan-demo-session');
      return null;
    }
  });
  const authenticate = (nextProfile: DemoProfile) => {
    setProfile(nextProfile);
    localStorage.setItem('gvan-demo-session', JSON.stringify(nextProfile));
    localStorage.setItem('gvan-demo-profile', JSON.stringify(nextProfile));
  };
  const logout = () => {
    setProfile(null);
    localStorage.removeItem('gvan-demo-session');
    setLocation('/login');
  };
  if (!profile) {
    return <DemoSessionContext.Provider value={{ logout }}>
      {location === '/register'
        ? <Register onAuthenticated={authenticate} />
        : location === '/forgot-password'
          ? <ForgotPassword />
        : <Login onAuthenticated={authenticate} />}
    </DemoSessionContext.Provider>;
  }
  if (location === '/login' || location === '/register') {
    return <DemoSessionContext.Provider value={{ logout }}><Home /></DemoSessionContext.Provider>;
  }
  return <DemoSessionContext.Provider value={{ logout }}><RoutedErrorBoundary><Switch>
    <Route path="/" component={Home} />
    <Route path="/identity" component={Identity} />
    <Route path="/how-to-use" component={HowToUse} />
    <Route path="/rules" component={Rules} />
    <Route path="/weekly-challenge" component={WeeklyChallenge} />
    <Route path="/wallet" component={Wallet} />
    <Route path="/contact-us" component={ContactUs} />
    <Route component={NotFound} />
  </Switch></RoutedErrorBoundary></DemoSessionContext.Provider>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;
