// Funnel Landing — single page optimized for WhatsApp conversion
// Phone: +56 9 2797 0014 → wa.me/56927970014
// Each CTA pre-fills a context-tagged message so source is trackable in WA.

const FL = {
  bg: '#0E0E0E',
  paper: '#F4EFE6',
  ink: '#141414',
  muted: '#8B8883',
  mutedDim: '#5a5854',
  accent: '#FF6633',
  podAccent: '#F4B81C',
  labAccent: '#4FD8C7',
  whatsapp: '#25D366',   // Official WhatsApp green
  cream: '#F4EFE6',
  display: "'Fraunces', serif",
  sans: "'Archivo', sans-serif",
  mono: "'Space Mono', monospace",
};

const WA_PHONE = '56927970014';

function waLink(context) {
  const msg = encodeURIComponent(`Hola Doppel, ${context}`);
  return `https://wa.me/${WA_PHONE}?text=${msg}`;
}

// ── Primitives ─────────────────────────────────────────────────

function WhatsAppIcon({ size = 16, color = '#fff' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ display: 'block' }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

// Iconos de trazo propios (24x24, stroke uniforme)
function StrokeIcon({ children, size = 22, color = '#141414' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color}
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
      {children}
    </svg>
  );
}
const ICONS = {
  camara: <><rect x="2.5" y="6.5" width="12.5" height="11" rx="2" /><path d="M15 10.5l6.5-3.5v10l-6.5-3.5" /></>,
  episodios: <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" />,
  reloj: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3.5 2" /></>,
  movil: <><path d="M12 21.5s-7-5.4-7-11.2A7 7 0 0 1 19 10.3c0 5.8-7 11.2-7 11.2z" /><circle cx="12" cy="10.3" r="2.4" /></>,
  concepto: <><path d="M12 3a6 6 0 0 0-3.4 10.9c.7.5 1.1 1.3 1.3 2.1h4.2c.2-.8.6-1.6 1.3-2.1A6 6 0 0 0 12 3z" /><path d="M9.5 19.5h5M10.5 22h3" /></>,
  guion: <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  rodaje: <><path d="M3.5 8.5v10a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-10H3.5z" /><path d="M3.5 8.5L6 3.5h14.5l-2.5 5M9.5 3.5L7 8.5M15 3.5l-2.5 5" /></>,
  post: <><path d="M4 7h7M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1" /><circle cx="14.5" cy="7" r="2" /><circle cx="8.5" cy="12" r="2" /><circle cx="16.5" cy="17" r="2" /></>,
  distribucion: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
};

function WAButton({ context, label = 'Hablemos', size = 'md', variant = 'cream', style = {} }) {
  const sizes = {
    sm: { pad: '10px 18px', fs: 12, ic: 13 },
    md: { pad: '14px 22px', fs: 13, ic: 14 },
    lg: { pad: '18px 30px', fs: 14, ic: 16 },
    xl: { pad: '20px 36px', fs: 16, ic: 18 },
  }[size];
  const styles = variant === 'cream'
    ? { background: FL.cream, color: FL.ink, border: 'none' }
    : variant === 'ink'
    ? { background: FL.ink, color: FL.cream, border: 'none' }
    : variant === 'green'
    ? { background: FL.whatsapp, color: '#fff', border: 'none' }
    : { background: 'transparent', color: FL.paper, border: `1px solid ${FL.paper}40` };
  const iconColor = variant === 'cream' ? FL.ink : variant === 'ink' ? FL.cream : variant === 'green' ? '#fff' : FL.paper;
  return (
    <a
      href={waLink(context)}
      target="_blank"
      rel="noopener"
      style={{
        ...styles,
        padding: sizes.pad, fontSize: sizes.fs, fontWeight: 600,
        letterSpacing: '0.02em', cursor: 'pointer', fontFamily: FL.sans,
        textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
        gap: 12, lineHeight: 1, borderRadius: 999, ...style,
      }}
    >
      {label}
      <span style={{ opacity: 0.55, display: 'inline-flex', alignItems: 'center' }}>
        <WhatsAppIcon size={sizes.ic} color={iconColor} />
      </span>
    </a>
  );
}

// ── Lazy Vimeo reel: only loads/plays when section enters viewport ──

function LazyVimeoReel({ id = '589999111', title = 'Doppel Reel' }) {
  const [active, setActive] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', aspectRatio: '16/9', width: '100%', background: '#000', overflow: 'hidden' }}>
      {active && (
        <iframe
          src={`https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0&dnt=1&autoplay=1&muted=1&loop=1&playsinline=1`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title={title}
        />
      )}
    </div>
  );
}

// ── Reveal: generic fade-up wrapper triggered by IntersectionObserver ──

function Reveal({ children, delay = 0, distance = 22, duration = 750, threshold = 0.2, style = {}, as: Tag = 'div' }) {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: '-60px 0px -60px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return (
    <Tag
      ref={ref}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : `translateY(${distance}px)`,
        transition: `opacity ${duration}ms ease ${delay}ms, transform ${duration}ms ease ${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}

// ── Animated stat: counts up + fades in once it enters viewport ─────

function AnimatedStat({ value, label, delay = 0, isLast = false }) {
  const [count, setCount] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef(null);

  const match = String(value).match(/^([+\-]?)(\d+)$/);
  const prefix = match ? match[1] : '';
  const target = match ? parseInt(match[2], 10) : 0;

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    const duration = 1400;
    let raf;
    let startTs = null;
    const tick = (now) => {
      if (startTs === null) startTs = now + delay;
      const elapsed = Math.max(0, now - startTs);
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, target, delay]);

  return (
    <div
      ref={ref}
      style={{
        paddingRight: 24,
        borderRight: !isLast ? `1px solid ${FL.paper}15` : 'none',
        paddingLeft: delay > 0 ? 24 : 0,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      <div style={{
        fontFamily: FL.display, fontSize: 52, fontWeight: 300,
        letterSpacing: '-0.03em', lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {prefix}{count}
      </div>
      <div style={{
        fontSize: 11, color: FL.muted, marginTop: 6,
        fontFamily: FL.mono, letterSpacing: '0.06em',
      }}>
        {label.toUpperCase()}
      </div>
    </div>
  );
}

// ── Client strip section with staggered fade-up entrance ─────────

function ClientStrip() {
  const [triggered, setTriggered] = React.useState(false);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setTriggered(true);
          obs.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: '-80px 0px -80px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const numRows = 3;
  const per = Math.ceil(CLIENT_LOGOS.length / numRows);
  const rows = Array.from({ length: numRows }, (_, r) =>
    CLIENT_LOGOS.slice(r * per, (r + 1) * per)
  ).filter(r => r.length > 0);

  // Header fades in first, then logos stagger after
  const headerDelay = 0;
  const logoBaseDelay = 300;
  const logoStep = 110;

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '48px 40px 56px',
        background: '#ffffff',
        color: FL.ink,
        borderTop: `1px solid ${FL.ink}10`,
      }}
    >
      <div
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: 28,
          opacity: triggered ? 1 : 0,
          transform: triggered ? 'translateY(0)' : 'translateY(8px)',
          transition: `opacity 0.6s ease ${headerDelay}ms, transform 0.6s ease ${headerDelay}ms`,
        }}
      >
        <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.ink + 'aa' }}>
          MARCAS QUE NOS HAN ELEGIDO
        </div>
        <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.ink + '66' }}>
          {String(CLIENT_LOGOS.length).padStart(2, '0')} / SELECCIÓN
        </div>
      </div>
      <div className="clients-grid" style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderTop: ri > 0 ? `1px solid ${FL.ink}12` : 'none',
            }}
          >
            {row.map((c, i) => {
              const globalIdx = ri * per + i;
              const delay = logoBaseDelay + globalIdx * logoStep;
              return (
                <div
                  key={c.name}
                  style={{
                    flex: 1, maxWidth: 150,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 80, padding: '0 14px',
                    borderRight: i < row.length - 1 ? `1px solid ${FL.ink}10` : 'none',
                    opacity: triggered ? 1 : 0,
                    transform: triggered ? 'translateY(0)' : 'translateY(18px)',
                    transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
                  }}
                >
                  <ClientLogo client={c} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Client logo (real image if provided, polished wordmark fallback) ──

function ClientLogo({ client }) {
  const [hover, setHover] = React.useState(false);
  const scale = client.scale || 1;
  if (client.src) {
    const hoverScale = hover ? 1.04 : 1;
    return (
      <img
        src={client.src}
        alt={client.name}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          maxHeight: 40, maxWidth: '100%', objectFit: 'contain',
          filter: hover ? 'none' : 'grayscale(100%) contrast(1.05)',
          opacity: hover ? 1 : 0.75,
          transition: 'opacity 0.25s ease, filter 0.3s ease, transform 0.25s ease',
          transform: `scale(${scale * hoverScale})`,
          transformOrigin: 'center',
        }}
      />
    );
  }
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: FL.display, fontWeight: 400, fontSize: 22,
        letterSpacing: '-0.02em', fontStyle: 'italic',
        color: FL.ink, opacity: hover ? 1 : 0.6,
        whiteSpace: 'nowrap', transition: 'opacity 0.25s ease',
      }}
    >
      {client.name}
    </span>
  );
}

// ── Landing ────────────────────────────────────────────────────

function FunnelLanding() {
  return (
    <div style={{ background: 'transparent', color: FL.paper, fontFamily: FL.sans, minHeight: '100vh' }}>
      {/* ── STICKY HEADER ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px', borderBottom: `1px solid ${FL.paper}15`,
        position: 'sticky', top: 0, background: 'rgba(14,14,14,0.72)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="assets/doppel-logo.png" alt="Doppel" style={{ height: 24, display: 'block', filter: 'invert(94%) sepia(8%) saturate(120%) hue-rotate(347deg) brightness(98%) contrast(94%)' }} />
          <span style={{
            fontFamily: FL.mono, fontSize: 9, fontWeight: 600, letterSpacing: '0.18em',
            color: FL.muted, paddingLeft: 12, borderLeft: `1px solid ${FL.paper}25`,
            lineHeight: 1.3,
          }}>ESTUDIO ·<br />LABORATORIO</span>
        </div>
        <nav style={{ display: 'flex', gap: 26, fontSize: 13, color: FL.paper + 'cc' }}>
          {[
            ['Estudio', '#cómo-trabajamos'],
            ['Portafolio', '#trabajos'],
            ['Lab', '#lab'],
            ['Apps', '#apps'],
          ].map(([l, h]) => (
            <a key={l} href={h} style={{ color: 'inherit', textDecoration: 'none' }}>{l}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a
            href="/podfactory/"
            style={{
              background: FL.podAccent, color: FL.ink, padding: '10px 16px',
              fontSize: 12, fontWeight: 700, fontFamily: FL.sans, letterSpacing: '0.04em',
              textDecoration: 'none', borderRadius: 999, display: 'inline-flex',
              alignItems: 'center', gap: 6, lineHeight: 1,
            }}
          >
            Pod Factory <span style={{ fontSize: 11, opacity: 0.8 }}>→</span>
          </a>
          <WAButton context="quiero conversar sobre un proyecto." label="Hablemos" size="sm" />
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ padding: '70px 40px 50px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontFamily: FL.mono, color: FL.muted, letterSpacing: '0.1em' }}>
            ( ESTUDIO CREATIVO · LABORATORIO DE TECNOLOGÍA · DESDE 2012 )
          </div>
        </div>

        {/* Two-column hero: copy left, image right */}
        <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '0.8fr 2fr', gap: 40, alignItems: 'center' }}>
          <div>
            <h1 style={{
              fontFamily: FL.display, fontWeight: 300, fontSize: 'clamp(28px,4.5vw,72px)', lineHeight: 0.96,
              letterSpacing: '-0.04em', margin: 0, color: FL.paper,
            }}>
              Producimos historias<br />
              <span style={{ fontStyle: 'italic', fontWeight: 400, color: FL.accent }}>y construimos las herramientas</span><br />
              para contarlas.
            </h1>

            <p style={{
              fontSize: 17, lineHeight: 1.5, maxWidth: 540, marginTop: 28,
              color: FL.paper + 'cc', fontWeight: 400,
            }}>
              Somos Doppel. Un estudio que piensa, filma y programa: spots,
              brand films, documentales, podcasts, experiencias 3D en tiempo
              real y aplicaciones propias.
            </p>

            {/* Primary CTA cluster */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 32, flexWrap: 'wrap' }}>
              <WAButton context="vengo desde la web, hablemos." label="Hablemos" size="lg" />
              <a href="#trabajos" style={{
                fontSize: 12, fontFamily: FL.mono, color: FL.paper, letterSpacing: '0.1em',
                textDecoration: 'none', borderBottom: `1px solid ${FL.paper}40`, paddingBottom: 4,
              }}>
                VER REEL ↓
              </a>
            </div>
          </div>

          {/* Powerful representative image — now a carousel */}
          <ImageCarousel images={CAROUSEL_IMAGES} autoplay={true} autoplayDelay={6000} />
        </div>

        {/* Trust stats */}
        <div className="stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
          marginTop: 70, paddingTop: 28, borderTop: `1px solid ${FL.paper}20`,
        }}>
          {[
            ['15', 'años de experiencia'],
            ['+500', 'proyectos producidos'],
            ['+40', 'marcas que confían'],
          ].map(([n, l], i, arr) => (
            <AnimatedStat key={i} value={n} label={l} delay={i * 180} isLast={i === arr.length - 1} />
          ))}
        </div>

        {/* Tres pilares: Estudio / Lab / Apps */}
        <div className="pillars-grid" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0,
          marginTop: 44, borderTop: `1px solid ${FL.paper}20`,
        }}>
          {[
            ['░ ESTUDIO', FL.accent, 'Producción audiovisual y podcast', 'Spots, brand films, documentales y Pod Factory: podcasts de la idea al capítulo 100.', '#cómo-trabajamos', 'assets/pillars/estudio.jpg'],
            ['░ LAB', FL.labAccent, 'Experiencias 3D, tiempo real e IA', 'Recorridos fotorrealistas, visualizaciones WebGL, gráfica generativa y pipelines con IA.', '#lab', 'assets/pillars/lab.jpg'],
            ['░ APPS', FL.paper, 'Productos propios en producción', 'Tachbook, WBCheck y HazTuRadio: software real, con usuarios reales, hecho en casa.', '#apps', 'assets/pillars/apps.jpg'],
          ].map(([tag, c, t, d, href, img], i) => (
            <Reveal key={tag} delay={i * 140} style={{
              padding: i === 0 ? '26px 24px 8px 0' : i === 2 ? '26px 0 8px 24px' : '26px 24px 8px',
              borderRight: i < 2 ? `1px solid ${FL.paper}12` : 'none',
            }}>
              <a href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <img
                  src={img}
                  alt={t}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', marginBottom: 16, border: `1px solid ${FL.paper}15` }}
                />
                <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: c, marginBottom: 12 }}>{tag}</div>
                <div style={{ fontFamily: FL.display, fontSize: 24, fontWeight: 400, lineHeight: 1.1 }}>{t}</div>
                <p style={{ fontSize: 13, color: FL.muted, lineHeight: 1.55, marginTop: 8 }}>{d}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── REEL ── */}
      <section id="trabajos" style={{ padding: '20px 40px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <LazyVimeoReel id="589999111" title="Doppel Reel" />
        </div>
      </section>

      {/* ── MID-FUNNEL CTA ── */}
      <section className="mid-cta" style={{
        padding: '40px 40px', background: FL.paper, color: FL.ink,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32,
      }}>
        <Reveal style={{ fontFamily: FL.display, fontSize: 40, letterSpacing: '-0.025em', lineHeight: 1.1, maxWidth: 720 }}>
          <Reveal delay={0}   style={{ fontWeight: 300, color: FL.ink + 'aa' }}>Comunicación efectiva.</Reveal>
          <Reveal delay={150} style={{ fontWeight: 600, color: FL.ink }}>Mensajes que llegan.</Reveal>
          <Reveal delay={300} style={{ fontWeight: 300, fontStyle: 'italic', color: FL.accent }}>Ideas que perduran.</Reveal>
        </Reveal>
        <Reveal delay={500}><WAButton context="quiero pensar un proyecto con ustedes." label="Hablemos" size="lg" /></Reveal>
      </section>

      {/* ── CLIENT STRIP ── */}
      <ClientStrip />

      {/* ── HOW WE WORK (360°) ── */}
      <section id="cómo-trabajamos" style={{ padding: '80px 40px 60px' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12,
        }}>
          <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.muted }}>
            CÓMO TRABAJAMOS / 360°
          </div>
          <div style={{ fontSize: 11, fontFamily: FL.mono, color: FL.muted, fontStyle: 'italic' }}>
            ( de la idea a la entrega )
          </div>
        </div>
        <Reveal as="h2" style={{
          fontFamily: FL.display, fontWeight: 300, fontSize: 64,
          letterSpacing: '-0.03em', margin: '0 0 40px', maxWidth: 900, lineHeight: 1.02,
        }}>
          Pensamos antes <span style={{ fontStyle: 'italic', color: FL.accent }}>de filmar.</span>
        </Reveal>

        <Reveal delay={150} style={{ marginBottom: 40 }}>
          <img
            src="assets/proceso.jpg"
            alt="Storyboard y guion sobre la mesa de trabajo"
            loading="lazy"
            style={{ width: '100%', aspectRatio: '21/9', objectFit: 'cover', display: 'block', border: `1px solid ${FL.paper}15` }}
          />
        </Reveal>

        <div className="reasons-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 0, borderTop: `1px solid ${FL.paper}25` }}>
          {[
            ['01', 'Concepto', 'Conversamos contigo y proponemos la idea que mueve el proyecto.', 'concepto'],
            ['02', 'Guion & arte', 'Escribimos, dirigimos arte, planificamos producción.', 'guion'],
            ['03', 'Rodaje', 'Equipo propio, set o locación. Cámara, sonido, dirección.', 'rodaje'],
            ['04', 'Post', 'Edición, color, sonido, masterizado.', 'post'],
            ['05', 'Distribución', 'Te dejamos listo para publicar en cualquier canal.', 'distribucion'],
          ].map(([n, t, d, ic], i) => (
            <Reveal key={n} delay={i * 120} style={{
              padding: '24px 16px',
              borderRight: i < 4 ? `1px solid ${FL.paper}15` : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontFamily: FL.mono, fontSize: 11, color: FL.accent }}>{n}</div>
                <StrokeIcon color={FL.accent} size={20}>{ICONS[ic]}</StrokeIcon>
              </div>
              <div style={{ fontFamily: FL.display, fontSize: 22, fontWeight: 400, marginBottom: 8, lineHeight: 1.1 }}>{t}</div>
              <div style={{ fontSize: 12, color: FL.muted, lineHeight: 1.5 }}>{d}</div>
            </Reveal>
          ))}
        </div>

        {/* Where it materializes */}
        <div className="where-grid" style={{
          marginTop: 48, padding: '36px 0 0', borderTop: `1px solid ${FL.paper}20`,
          display: 'grid', gridTemplateColumns: '0.7fr 1fr 1fr', gap: 24,
        }}>
          <Reveal style={{ paddingRight: 24 }}>
            <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.muted, marginBottom: 14 }}>
              DÓNDE ATERRIZA
            </div>
            <h3 style={{ fontFamily: FL.display, fontWeight: 300, fontSize: 36, lineHeight: 1.05, letterSpacing: '-0.025em', margin: 0 }}>
              Dos casas para <span style={{ fontStyle: 'italic', color: FL.accent }}>materializar</span> la idea.
            </h3>
          </Reveal>
          <Reveal delay={160} style={{ paddingLeft: 24, borderLeft: `1px solid ${FL.paper}20` }}>
            <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.accent, marginBottom: 10 }}>░ MEDIA</div>
            <div style={{ fontFamily: FL.display, fontSize: 26, fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>Producción audiovisual</div>
            <div style={{ fontSize: 13, color: FL.muted, lineHeight: 1.5 }}>
              Brand films, comerciales, documentales y contenido propio.
            </div>
          </Reveal>
          <Reveal delay={280} style={{ paddingLeft: 24, borderLeft: `1px solid ${FL.paper}20` }}>
            <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.podAccent, marginBottom: 10 }}>░ POD FACTORY · BY DOPPEL</div>
            <div style={{ fontFamily: FL.display, fontSize: 26, fontWeight: 400, lineHeight: 1.1, marginBottom: 8 }}>Producción de podcasts</div>
            <div style={{ fontSize: 13, color: FL.muted, lineHeight: 1.5 }}>
              Estudio móvil multicámara 4K. Grabamos donde estés.
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WORK GRID ── */}
      <section style={{ padding: '70px 40px' }}>
        <Reveal style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
          <h2 style={{ fontFamily: FL.display, fontWeight: 300, fontSize: 56, letterSpacing: '-0.03em', margin: 0 }}>
            Proyectos <span style={{ fontStyle: 'italic', color: FL.muted }}>destacados</span>
          </h2>
          <a href={waLink('quiero ver más proyectos del portafolio.')} target="_blank" rel="noopener" style={{ fontSize: 12, fontFamily: FL.mono, color: FL.muted, letterSpacing: '0.1em', textDecoration: 'none' }}>VER TODOS →</a>
        </Reveal>
        <div className="work-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {PROJECTS.slice(0, 4).map((p, i) => (
            <Reveal key={p.vimeoId} delay={150 + i * 130}>
              <div style={{ position: 'relative', aspectRatio: '16/9', width: '100%', background: '#000', overflow: 'hidden' }}>
                <iframe
                  src={`https://player.vimeo.com/video/${p.vimeoId}?title=0&byline=0&portrait=0&dnt=1`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title={`${p.client} · ${p.title}`}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 }}>
                <div>
                  <div style={{ fontFamily: FL.display, fontSize: 22, fontWeight: 400 }}>{p.client} · {p.title}</div>
                  <div style={{ fontSize: 11, color: FL.muted, fontFamily: FL.mono, letterSpacing: '0.08em', marginTop: 4 }}>
                    {p.type.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: FL.muted, fontFamily: FL.mono }}>{p.year}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── POD FACTORY (STUDIO) SECTION ── */}
      <section id="pod-factory" style={{ background: FL.paper, color: FL.ink, padding: '70px 40px' }}>
        {/* Pod Factory header lockup */}
        <Reveal style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, marginBottom: 40, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <img
              src="assets/podfactory-logo.png"
              alt="Pod Factory"
              style={{ display: 'block', height: 110, width: 'auto' }}
            />
            <div style={{
              paddingLeft: 22, borderLeft: `1.5px solid ${FL.ink}25`,
              fontFamily: FL.mono, fontSize: 11, letterSpacing: '0.2em', lineHeight: 1.7,
            }}>
              <div style={{ color: FL.ink + '99' }}>POD FACTORY</div>
              <div style={{ color: FL.ink, fontWeight: 600 }}>BY DOPPEL</div>
              <div style={{ marginTop: 6, color: FL.ink + '99' }}>EST. 2024 · SANTIAGO, CHILE</div>
            </div>
          </div>
          <div style={{
            fontFamily: FL.display, fontStyle: 'italic', fontWeight: 400, fontSize: 22,
            color: FL.ink + 'aa', letterSpacing: '-0.01em',
          }}>
            Producción de podcasts
          </div>
        </Reveal>

        <div className="pod-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'start' }}>
          <Reveal delay={150}>
            <h2 style={{ fontFamily: FL.sans, fontWeight: 800, fontSize: 76, lineHeight: 0.94, letterSpacing: '-0.035em', margin: 0 }}>
              ¿Quieres lanzar<br />tu podcast?
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 480, marginTop: 24, color: '#2a2a2a' }}>
              Pod Factory es la casa de podcasts y vodcasts de Doppel.
              Multicámara 4K, masterización incluida y un equipo que te acompaña
              desde la idea al capítulo 100. Grabamos donde estés.
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 28, alignItems: 'center', flexWrap: 'wrap' }}>
              <WAButton context="quiero hacer mi podcast con Pod Factory." label="Quiero mi podcast" size="lg" variant="ink" />
              <a href="/podfactory/" style={{
                fontSize: 13, fontFamily: FL.mono, color: FL.ink, letterSpacing: '0.08em',
                textDecoration: 'none', borderBottom: `1px solid ${FL.ink}`, paddingBottom: 4,
                fontWeight: 600,
              }}>
                CONOCER POD FACTORY →
              </a>
            </div>
          </Reveal>

          {/* Mini features grid */}
          <div className="mini-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['4 cámaras 4K', '#1F3FA3', 'camara'],
              ['+300 episodios producidos', '#D92E2E', 'episodios'],
              ['24h entrega masterizada', '#EF6A1F', 'reloj'],
              ['Grabamos donde estés', '#F4B81C', 'movil'],
            ].map(([t, c, ic], i) => (
              <Reveal key={i} delay={300 + i * 110} style={{ border: `1.5px solid ${FL.ink}`, background: FL.paper, padding: 18, minHeight: 132, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ height: 6, background: c, width: 40 }} />
                <StrokeIcon color={FL.ink} size={26}>{ICONS[ic]}</StrokeIcon>
                <div style={{ fontFamily: FL.sans, fontWeight: 700, fontSize: 18, letterSpacing: '-0.015em' }}>{t}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAB ── */}
      <section id="lab" style={{ padding: '80px 40px', borderTop: `1px solid ${FL.paper}15` }}>
        <Reveal style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.labAccent, marginBottom: 14 }}>
          LAB / TECNOLOGÍA APLICADA
        </Reveal>
        <Reveal as="h2" delay={100} style={{
          fontFamily: FL.display, fontWeight: 300, fontSize: 56, letterSpacing: '-0.03em',
          margin: '0 0 16px', maxWidth: 900, lineHeight: 1.02,
        }}>
          Espacios reales, <span style={{ fontStyle: 'italic', color: FL.labAccent }}>gemelos digitales.</span>
        </Reveal>
        <Reveal as="p" delay={200} style={{ fontSize: 16, lineHeight: 1.55, maxWidth: 600, color: FL.paper + 'bb', margin: '0 0 40px' }}>
          Capturamos lugares reales y los convertimos en experiencias navegables
          en el navegador: sin descargas, sin visores, en cualquier pantalla.
          Y cuando el proyecto necesita una herramienta que no existe, la construimos.
        </Reveal>
        <div className="lab-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            ['GAUSSIAN SPLATTING', 'Recorridos 3D fotorrealistas', 'De un video de tu espacio a un recorrido virtual navegable: showrooms, cabinas, plantas, retail. Corre en el navegador, también en el teléfono.', 'assets/lab/splatting.jpg'],
            ['WEBGL · TIEMPO REAL', 'Visualizaciones interactivas', 'Mapas, atlas y escenas 3D a medida para presentaciones, stands y activaciones de marca.', 'assets/lab/webgl.jpg'],
            ['MOTION GENERATIVO', 'Gráfica programada', 'HUDs, lower thirds y piezas de motion generadas por código: precisión de pixel, iteración en minutos.', 'assets/lab/motion.jpg'],
            ['IA APLICADA', 'Voces, avatares y pipelines', 'Locución sintética, video generativo y automatización de flujos de producción, con dirección humana.', 'assets/lab/ia.jpg'],
          ].map(([tag, t, d, img], i) => (
            <Reveal key={tag} delay={250 + i * 120} style={{ border: `1px solid ${FL.labAccent}40`, padding: '24px 26px' }}>
              <img
                src={img}
                alt={t}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', marginBottom: 18, border: `1px solid ${FL.labAccent}25` }}
              />
              <div style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.labAccent, marginBottom: 12 }}>{tag}</div>
              <div style={{ fontFamily: FL.display, fontSize: 26, fontWeight: 400, lineHeight: 1.1 }}>{t}</div>
              <p style={{ fontSize: 13, color: FL.muted, lineHeight: 1.55, marginTop: 8, marginBottom: 0 }}>{d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal delay={500} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 34, flexWrap: 'wrap' }}>
          <WAButton context="quiero ver una demo del Lab (3D / tiempo real / IA)." label="Pide una demo" size="lg" />
          <span style={{ fontSize: 11, fontFamily: FL.mono, color: FL.muted, letterSpacing: '0.08em' }}>
            LOS DEMOS DE CLIENTE SON PRIVADOS — TE MOSTRAMOS EN UNA LLAMADA.
          </span>
        </Reveal>
      </section>

      {/* ── APPS ── */}
      <section id="apps" style={{ padding: '80px 40px', borderTop: `1px solid ${FL.paper}15` }}>
        <Reveal style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.muted, marginBottom: 14 }}>
          APPS / PRODUCTOS PROPIOS
        </Reveal>
        <Reveal as="h2" delay={100} style={{
          fontFamily: FL.display, fontWeight: 300, fontSize: 56, letterSpacing: '-0.03em',
          margin: '0 0 40px', maxWidth: 900, lineHeight: 1.02,
        }}>
          Software que <span style={{ fontStyle: 'italic', color: FL.accent }}>ya vuela.</span>
        </Reveal>
        <div className="apps-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {[
            ['Tachbook', 'tachbook.com', 'https://tachbook.com', 'Bitácora digital para pilotos y aeronaves: comunidad, meteo aeronáutica y análisis de vuelo. En el App Store.', 'assets/apps/tachbook.jpg'],
            ['WBCheck', 'wbcheck.com', 'https://wbcheck.com', 'Peso y balance para aviación general: cálculo visual, presets verificados, listo antes de rodar.', 'assets/apps/wbcheck.jpg'],
            ['HazTuRadio', 'hazturadio.com', 'https://hazturadio.com', 'Tu radio online en minutos: programación, locutor IA y emisión continua, sin instalar nada.', 'assets/apps/hazturadio.jpg'],
          ].map(([name, domain, url, d, img], i) => (
            <Reveal key={name} delay={200 + i * 130} style={{ border: `1px solid ${FL.paper}25`, padding: '26px 26px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <a href={url} target="_blank" rel="noopener" style={{ display: 'block', margin: '-8px 0 6px' }}>
                <img
                  src={img}
                  alt={`${name} — captura de pantalla`}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block', border: `1px solid ${FL.paper}20` }}
                />
              </a>
              <div style={{ fontFamily: FL.display, fontSize: 30, fontWeight: 400, letterSpacing: '-0.02em' }}>{name}</div>
              <p style={{ fontSize: 13, color: FL.muted, lineHeight: 1.55, margin: 0, flex: 1 }}>{d}</p>
              <a href={url} target="_blank" rel="noopener" style={{
                fontSize: 11, fontFamily: FL.mono, color: FL.accent, letterSpacing: '0.1em',
                textDecoration: 'none', marginTop: 8,
              }}>{domain.toUpperCase()} ↗</a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={550} as="p" style={{ fontSize: 15, marginTop: 34, color: FL.paper + 'cc', maxWidth: 560, lineHeight: 1.55 }}>
          ¿Tu operación necesita una herramienta así? La diseñamos, la construimos
          y la dejamos corriendo.{' '}
          <a href={waLink('necesito una aplicación para mi operación.')} target="_blank" rel="noopener" style={{ color: FL.accent }}>
            Hablemos por WhatsApp →
          </a>
        </Reveal>
      </section>

      {/* ── WHY DOPPEL ── */}
      <section id="por-qué-doppel" style={{ padding: '80px 40px' }}>
        <Reveal style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.muted, marginBottom: 14 }}>
          POR QUÉ DOPPEL
        </Reveal>
        <Reveal as="h2" delay={100} style={{
          fontFamily: FL.display, fontWeight: 300, fontSize: 56, letterSpacing: '-0.03em',
          margin: '0 0 40px', maxWidth: 900, lineHeight: 1.02,
        }}>
          Cuatro razones <span style={{ fontStyle: 'italic', color: FL.accent }}>concretas.</span>
        </Reveal>
        <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {[
            ['Pensamos, no sólo filmamos', 'Creamos el concepto o lo afilamos contigo. Antes de prender cámaras hay una idea sólida y un punto de vista.', 'assets/why/concepto.jpg'],
            ['Producimos y programamos', 'Cámaras, sonido, dirección, edición, 3D y desarrollo de software. Un mismo equipo lleva la idea de la pantalla grande al navegador.', 'assets/why/produce.jpg'],
            ['15 años de track record', '+500 proyectos para Walmart, Ford, LATAM, Entel, Enel, Coca-Cola Andina y más. Sabemos cómo entregar a tiempo.', 'assets/why/track-record.jpg'],
            ['Respondemos rápido', 'Sin formularios eternos ni cadenas de correos. Un humano del equipo te contesta directo.', 'assets/why/respuesta.jpg'],
          ].map(([t, d, img], i) => (
            <Reveal key={i} delay={250 + i * 140} style={{ padding: '24px 0 28px', borderTop: `1px solid ${FL.paper}20` }}>
              <img
                src={img}
                alt={t}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block', marginBottom: 20, border: `1px solid ${FL.paper}15` }}
              />
              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ fontFamily: FL.mono, fontSize: 14, color: FL.accent, minWidth: 30 }}>0{i + 1}</div>
                <div>
                  <div style={{ fontFamily: FL.display, fontSize: 30, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{t}</div>
                  <div style={{ fontSize: 14, color: FL.muted, lineHeight: 1.5, marginTop: 8, maxWidth: 480 }}>{d}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '40px 40px 70px', borderTop: `1px solid ${FL.paper}15` }}>
        <Reveal style={{ fontSize: 10, fontFamily: FL.mono, letterSpacing: '0.2em', color: FL.muted, marginBottom: 32 }}>
          PREGUNTAS FRECUENTES
        </Reveal>
        <div style={{ borderTop: `1px solid ${FL.paper}20` }}>
          {[
            ['¿Atienden proyectos chicos o solo grandes marcas?', 'Atendemos ambos. El equipo se arma según el alcance — desde un capítulo de podcast hasta una campaña full para una marca grande.'],
            ['¿Cuánto demora una producción?', 'Depende del formato. Un brand film promedio toma 4–8 semanas desde el brief. Un podcast lo grabas y editamos en 24–72h.'],
            ['¿Trabajan fuera de Santiago?', 'Sí. Producimos en todo Chile y tenemos estudio móvil para grabar podcasts en cualquier locación.'],
            ['¿También hacen software y experiencias 3D?', 'Sí. El Lab de Doppel construye recorridos 3D fotorrealistas, visualizaciones en tiempo real y aplicaciones a medida. Tenemos productos propios en producción: Tachbook, WBCheck y HazTuRadio.'],
            ['¿Cómo cobran?', 'Cotizamos por proyecto con todo incluido. Cuéntanos y te respondemos rápido.'],
          ].map(([q, a], i) => (
            <Reveal as="details" key={i} delay={150 + i * 100} style={{ borderBottom: `1px solid ${FL.paper}20`, padding: '18px 0' }}>
              <summary style={{
                fontFamily: FL.display, fontSize: 22, fontWeight: 400, letterSpacing: '-0.02em',
                cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {q}
                <span style={{ color: FL.accent, fontSize: 24, lineHeight: 1 }}>+</span>
              </summary>
              <p style={{ fontSize: 14, color: FL.muted, lineHeight: 1.55, marginTop: 12, marginBottom: 4, maxWidth: 720 }}>
                {a}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding: '90px 40px', background: FL.accent, color: FL.ink }}>
        <div className="final-cta-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <Reveal style={{ fontSize: 11, fontFamily: FL.mono, letterSpacing: '0.2em', marginBottom: 18 }}>
              ⏁ CONVERSEMOS
            </Reveal>
            <Reveal as="h2" delay={120} style={{
              fontFamily: FL.display, fontWeight: 300, fontSize: 'clamp(56px,7.5vw,112px)', lineHeight: 0.88,
              letterSpacing: '-0.04em', margin: 0, color: FL.ink,
            }}>
              Pensemos<br />
              <span style={{ fontStyle: 'italic', fontWeight: 400 }}>algo bueno.</span>
            </Reveal>
            <Reveal as="p" delay={280} style={{ fontSize: 19, lineHeight: 1.4, maxWidth: 580, marginTop: 28, color: FL.ink }}>
              Respondemos rápido en horario hábil. Sin formularios, sin esperas:
              un humano del equipo que va a producir tu proyecto.
            </Reveal>
            <Reveal delay={440} style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 40 }}>
              <WAButton context="vengo desde la web, conversemos." label="Hablemos" size="xl" variant="ink" />
            </Reveal>
          </div>
          <Reveal delay={250}>
            <img
              src="assets/pensemos.jpg"
              alt="Rincón de conversación con café y cuaderno a la luz de la tarde"
              loading="lazy"
              style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', border: `2px solid ${FL.ink}` }}
            />
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer-grid" style={{ padding: '40px 40px 28px', background: FL.bg }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          paddingBottom: 24, borderBottom: `1px solid ${FL.paper}20`,
        }}>
          <div>
            <img src="assets/doppel-logo.png" alt="Doppel" style={{ height: 30, display: 'block', filter: 'invert(94%) sepia(8%) saturate(120%) hue-rotate(347deg) brightness(98%) contrast(94%)' }} />
            <div style={{ fontFamily: FL.mono, fontSize: 11, color: FL.muted, marginTop: 14, letterSpacing: '0.1em' }}>
              ESTUDIO CREATIVO · LABORATORIO DE TECNOLOGÍA · SANTIAGO
            </div>
            <div style={{ fontFamily: FL.mono, fontSize: 11, color: FL.muted, marginTop: 10, letterSpacing: '0.1em' }}>
              <a href="/pulse/" style={{ color: 'inherit', textDecoration: 'none' }}>PULSE</a>
              {' · '}
              <a href="/crm/" style={{ color: 'inherit', textDecoration: 'none' }}>CRM</a>
              {' · '}
              <a href="/brandframe/" style={{ color: 'inherit', textDecoration: 'none' }}>BRANDFRAME</a>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: FL.mono, fontSize: 12, color: FL.muted, lineHeight: 1.8 }}>
            HOLA@DOPPEL.CL<br />
            +56 9 2797 0014<br />
            SANTIAGO, CHILE
          </div>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', marginTop: 22,
          fontSize: 11, fontFamily: FL.mono, color: FL.muted, letterSpacing: '0.08em',
        }}>
          <span>© DOPPEL · 2011—2026</span>
          <span>IG · VIMEO · LINKEDIN · SPOTIFY</span>
        </div>
      </footer>

      {/* ── STICKY FLOATING WHATSAPP BUTTON ── */}
      <div className="whatsapp-float" style={{
        position: 'absolute', bottom: 24, right: 24, zIndex: 20,
      }}>
        <a
          href={waLink('vengo desde la web, conversemos.')}
          target="_blank" rel="noopener"
          style={{
            background: FL.cream, color: FL.ink, borderRadius: 999,
            padding: '12px 18px 12px 16px', display: 'inline-flex', alignItems: 'center', gap: 10,
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
            textDecoration: 'none', cursor: 'pointer',
            fontFamily: FL.sans, fontSize: 13, fontWeight: 600,
          }}
        >
          Hablemos
          <span style={{ opacity: 0.55, display: 'inline-flex' }}>
            <WhatsAppIcon size={14} color={FL.ink} />
          </span>
        </a>
      </div>
    </div>
  );
}

window.FunnelLanding = FunnelLanding;
window.WAButton = WAButton;
window.waLink = waLink;
