import { Link, createFileRoute } from "@tanstack/react-router"
import {
  BookOpen,
  Braces,
  CheckCircle2,
  Eye,
  FileCode,
  Github,
  Layers,
  ListChecks,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  SquareTerminal,
  Terminal,
  Zap,
} from "lucide-react"
import {
  type ComponentType,
  type ReactNode,
  type SVGProps,
  createContext,
  useContext,
  useRef,
  useState,
} from "react"
import { BackToTop } from "livemark/components/BackToTop"
import { Banner } from "livemark/components/Banner"
import { Header } from "livemark/components/Header"
import { buttonVariants } from "livemark/elements/button"
import { useInView } from "livemark/hooks/in-view"
import { cn } from "cn"

export const Route = createFileRoute("/")({
  component: Landing,
})

function Landing() {
  const [lang, setLang] = useState<Lang>("python")
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Banner />
      <Header />
      <main className="flex flex-col">
        <Hero />
        <Freedom />
        <Features />
        <Showcase />
        <FinalCta />
        <Datist />
      </main>
      <BackToTop />
    </LangContext.Provider>
  )
}

const tk = {
  comment: "text-[#9ca0b0] dark:text-[#6c7086]",
  keyword: "text-[#8839ef] dark:text-[#cba6f7]",
  type: "text-[#df8e1d] dark:text-[#f9e2af]",
  string: "text-[#40a02b] dark:text-[#a6e3a1]",
  func: "text-[#1e66f5] dark:text-[#89b4fa]",
  punct: "text-[#7c7f93] dark:text-[#9399b2]",
  body: "text-[#4c4f69] dark:text-[#cdd6f4]",
  dim: "text-[#9ca0b0] dark:text-[#6c7086]",
  flag: "text-[#179299] dark:text-[#94e2d5]",
  prompt: "text-[#d20f39] dark:text-[#f38ba8]",
  key: "text-[#1e66f5] dark:text-[#89b4fa]",
  pass: "text-[#40a02b] dark:text-[#a6e3a1]",
  skip: "text-[#df8e1d] dark:text-[#f9e2af]",
  heading: "text-[#1e66f5] dark:text-[#89b4fa] font-semibold",
}

type Lang = "python" | "typescript"

const langIds: Lang[] = ["python", "typescript"]

const langs: Record<
  Lang,
  {
    label: string
    fence: string
    runner: string
    runners: string
  }
> = {
  python: {
    label: "Python",
    fence: "python",
    runner: "pytest",
    runners: "pytest",
  },
  typescript: {
    label: "TypeScript",
    fence: "ts",
    runner: "vitest",
    runners: "vitest and jest",
  },
}

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "python",
  setLang: () => {},
})

function useLang() {
  return useContext(LangContext)
}

function LangTabs() {
  const { lang, setLang } = useLang()
  return (
    <div
      role="tablist"
      aria-label="Language"
      className="inline-flex gap-1 rounded-control border border-border bg-card p-1"
    >
      {langIds.map(id => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={lang === id}
          onClick={() => setLang(id)}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            lang === id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {langs[id].label}
        </button>
      ))}
    </div>
  )
}

const keywords: Record<Lang, Set<string>> = {
  python: new Set([
    "from",
    "import",
    "assert",
    "with",
    "as",
    "def",
    "return",
    "async",
    "await",
  ]),
  typescript: new Set(["import", "from", "const", "return", "async", "await", "new"]),
}

const TOKEN =
  /(#.*|\/\/.*)|(f?"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(@\w+)|(\b\d+\b)|([A-Za-z_]\w*)|([^\sA-Za-z_\d"`#@]+)|(\s+)|([\s\S])/g

function highlightCode(code: string, lang: Lang) {
  return [...code.matchAll(TOKEN)].map(match => {
    const [text, comment, string, decorator, number, word, punct] = match
    const next = code[match.index + text.length]
    const className = comment
      ? tk.comment
      : string
        ? tk.string
        : decorator
          ? tk.func
          : number
            ? tk.type
            : word
              ? readWordClass(word, next, lang)
              : punct
                ? tk.punct
                : undefined
    return className ? (
      <span key={match.index} className={className}>
        {text}
      </span>
    ) : (
      text
    )
  })
}

function readWordClass(word: string, next: string | undefined, lang: Lang) {
  if (keywords[lang].has(word)) return tk.keyword
  if (next === "(") return tk.func
  if (/^[A-Z]/.test(word)) return tk.type
  return undefined
}

function highlightMarkdown(source: string, lang: Lang) {
  let inFence = false
  return source.split("\n").map((line, i) => {
    let content: ReactNode
    if (line.startsWith("```")) {
      inFence = !inFence
      content = (
        <>
          <span className={tk.punct}>```</span>
          <span className={tk.flag}>{line.slice(3)}</span>
        </>
      )
    } else if (inFence) {
      content = highlightCode(line, lang)
    } else if (line.startsWith("#")) {
      content = <span className={tk.heading}>{line}</span>
    } else {
      content = <span className={tk.dim}>{line}</span>
    }
    return (
      <span key={i}>
        {content}
        {"\n"}
      </span>
    )
  })
}

function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-6rem)] items-center overflow-hidden border-b border-border">
      <BackgroundGrid />
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28 lg:pt-8 lg:pb-14 lg:grid lg:grid-cols-[27rem_minmax(0,1fr)] lg:items-center lg:gap-14">
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out">
          <p className="text-primary text-xs font-semibold tracking-[0.18em] uppercase">
            Open source · MIT License
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-5xl">
            Docs that run
            <br />
            <span className="box-decoration-clone bg-linear-to-r from-primary/20 to-primary/20 bg-size-[100%_0.3em] bg-position-[0_88%] bg-no-repeat">
              in your test suite.
            </span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
            Mark a code block in any{" "}
            <code className="font-mono text-foreground">.md</code> file with{" "}
            <code className="font-mono text-foreground">test</code>. Irondocs runs it as a
            real pytest, vitest or jest test — no separate spec file, no boilerplate, no
            drift between docs and code.
          </p>
          <HeroActions />
        </div>
        <div className="mt-12 lg:mt-0 xl:w-[60rem] animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out">
          <HeroCarousel slides={slides} />
        </div>
      </div>
    </section>
  )
}

function HeroActions() {
  const { lang } = useLang()
  return (
    <>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          to="/$"
          params={{ _splat: `${lang}/introduction` }}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "flex-1 px-3 no-underline sm:flex-none sm:px-5",
          )}
        >
          <Rocket className="size-4" />
          Get started
        </Link>
        <a
          href="https://github.com/datisthq/irondocs"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "flex-1 px-3 no-underline sm:flex-none sm:px-5",
          )}
        >
          <Github className="size-4" />
          View source
        </a>
      </div>
      <div className="mt-6 hidden sm:inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-1 rounded-[1.25rem] border border-border bg-card/50 backdrop-blur px-4 py-2 font-mono text-sm text-muted-foreground">
        <span className="text-primary select-none">$</span>
        <span>
          <span className="text-foreground">pip install</span> irondocs
        </span>
        <span className="text-primary select-none">$</span>
        <span>
          <span className="text-foreground">npm install</span> irondocs
        </span>
      </div>
    </>
  )
}

interface Slide {
  id: string
  title: string
  terminal: string
  source: { label: string; file: string; code: string; lang: Lang | "toml" }
}

const slides: Slide[] = [
  {
    id: "pytest",
    title: "pytest",
    terminal: `$ pytest docs/ -v

docs/install.md::Installation PASSED          [ 20%]
docs/usage.md::Adds two numbers PASSED        [ 40%]
docs/usage.md::Handles negatives PASSED       [ 60%]
docs/usage.md::Reads a file #1 PASSED         [ 80%]
docs/usage.md::Reads a file #2 SKIPPED        [100%]

============ 4 passed, 1 skipped in 0.04s ============`,
    source: {
      label: "Wired in with one line",
      file: "pyproject.toml",
      code: `[tool.pytest.ini_options]
irondocs_files = ["docs/*.md"]`,
      lang: "toml",
    },
  },
  {
    id: "vitest",
    title: "vitest",
    terminal: `$ pnpm vitest run docs/

 ✓ docs/install.md (1)
   ✓ Installation
 ✓ docs/usage.md (4)
   ✓ Adds two numbers
   ✓ Handles negatives
   ✓ Reads a file #1
   ↓ Reads a file #2

 Test Files  2 passed (2)
      Tests  4 passed | 1 skipped (5)`,
    source: {
      label: "Wired in with one line",
      file: "vite.config.ts",
      code: `plugins: [irondocs()],
test: { include: ["docs/**/*.md"] }`,
      lang: "typescript",
    },
  },
  {
    id: "jest",
    title: "jest",
    terminal: `$ pnpm jest docs/

 PASS  docs/install.md
 PASS  docs/usage.md
  usage.md
    ✓ Adds two numbers (2 ms)
    ✓ Handles negatives (1 ms)
    ✓ Reads a file #1 (1 ms)
    ○ skipped Reads a file #2

Test Suites: 2 passed, 2 total
Tests:       1 skipped, 4 passed, 5 total`,
    source: {
      label: "Wired in with one line",
      file: "jest.config.ts",
      code: `transform: { "\\\\.md$": "irondocs/jest" },
testMatch: ["**/docs/**/*.md"]`,
      lang: "typescript",
    },
  },
  {
    id: "failure",
    title: "Failure",
    terminal: `$ pytest docs/usage.md
_________________ Adds two numbers _________________

    ## Adds two numbers

    \`\`\`python test
    from mylib import add

>   assert add(1, 2) == 4
E   assert 3 == 4
E    +  where 3 = add(1, 2)

docs/usage.md:7: AssertionError
============ 1 failed, 3 passed in 0.05s ============`,
    source: {
      label: "Points at the markdown line",
      file: "docs/usage.md",
      code: `\`\`\`python test
assert add(1, 2) == 4`,
      lang: "python",
    },
  },
]

function HeroCarousel(props: { slides: Slide[] }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [stopped, setStopped] = useState(false)
  const stoppedRef = useRef(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <figure className="overflow-hidden rounded-card border border-border bg-card shadow-xl">
        <div className="flex items-center gap-5 border-b border-border bg-muted/50 px-4 py-2">
          <span aria-hidden className="hidden gap-1.5 sm:flex">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </span>
          <div role="tablist" className="flex min-w-0 gap-1">
            {props.slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-controls={`hero-slide-${slide.id}`}
                onClick={() => {
                  stoppedRef.current = true
                  setActive(index)
                  setStopped(true)
                }}
                className={cn(
                  "relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-control px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                  index === active
                    ? "bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn("font-mono text-xs", index === active && "text-primary")}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={index === active ? undefined : "hidden sm:inline"}>
                  {slide.title}
                </span>
                {index === active ? (
                  <span
                    key={stopped ? "stopped" : active}
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-primary/70",
                      !stopped && "hero-carousel-progress",
                    )}
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                    onAnimationEnd={() => {
                      if (stoppedRef.current) return
                      setActive(current => (current + 1) % props.slides.length)
                    }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
        <div className="grid">
          {props.slides.map((slide, index) => (
            <div
              key={slide.id}
              id={`hero-slide-${slide.id}`}
              role="tabpanel"
              aria-hidden={index !== active}
              className={cn(
                "[grid-area:1/1] transition-opacity duration-700 motion-reduce:transition-none",
                index === active ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <TerminalPanel terminal={slide.terminal} />
            </div>
          ))}
        </div>
      </figure>
      <div className="mt-4 grid lg:absolute lg:-bottom-10 lg:-left-10 lg:mt-0 lg:w-[24rem]">
        {props.slides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={index !== active}
            inert={index !== active}
            className={cn(
              "[grid-area:1/1] transition-opacity duration-700 motion-reduce:transition-none",
              index === active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <SourceChip source={slide.source} />
          </div>
        ))}
      </div>
    </div>
  )
}

function TerminalPanel(props: { terminal: string }) {
  return (
    <pre className="min-h-[22rem] overflow-x-auto p-5 font-mono text-xs leading-relaxed sm:aspect-[16/10] sm:min-h-0 sm:text-sm lg:pb-20 xl:p-8 xl:text-base">
      <code className={tk.body}>{highlightTerminal(props.terminal)}</code>
    </pre>
  )
}

function SourceChip(props: { source: Slide["source"] }) {
  const lang = props.source.lang
  return (
    <figure className="flex h-full gap-3 rounded-card border border-primary/25 bg-card p-4 shadow-lg">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <SquareTerminal className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          {props.source.label}
        </p>
        <figcaption className="mt-1 font-mono text-xs text-muted-foreground">
          {props.source.file}
        </figcaption>
        <pre className="mt-2 overflow-x-auto font-mono text-sm leading-relaxed">
          <code className={tk.body}>
            {lang === "toml"
              ? highlightToml(props.source.code)
              : lang === "python"
                ? highlightMarkdown(props.source.code, lang)
                : highlightCode(props.source.code, lang)}
          </code>
        </pre>
      </div>
    </figure>
  )
}

function highlightToml(code: string) {
  return code.split("\n").map((line, i) => {
    const [key, value] = line.split(" = ")
    return (
      <span key={i}>
        {value === undefined ? (
          <span className={tk.type}>{line}</span>
        ) : (
          <>
            <span className={tk.key}>{key}</span>
            <span className={tk.punct}> = </span>
            {highlightCode(value, "python")}
          </>
        )}
        {"\n"}
      </span>
    )
  })
}

function BackgroundGrid() {
  return (
    <>
      <style href="irondocs-hero-background" precedence="default">
        {BACKGROUND_GRID_CSS}
      </style>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent_98%)]">
          <div className="strata strata-drift absolute inset-y-0 -inset-x-11 opacity-50" />
          <div className="hero-scan-x from-primary/0 via-primary/16 to-primary/0 absolute inset-y-0 w-[40%] bg-gradient-to-r" />
          <div className="hero-scan-y from-secondary/0 via-secondary/16 to-secondary/0 absolute inset-x-0 h-[40%] bg-gradient-to-b" />
        </div>
      </div>
      <div
        aria-hidden
        className="hero-drift bg-primary/15 pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full blur-3xl"
      />
    </>
  )
}

const BACKGROUND_GRID_CSS = `
@keyframes hero-scan-x {
  0% {
    transform: translateX(-55%);
    opacity: 0;
  }
  5%,
  45% {
    opacity: 1;
  }
  50%,
  100% {
    transform: translateX(155%);
    opacity: 0;
  }
}

@keyframes hero-scan-y {
  0%,
  50% {
    transform: translateY(-55%);
    opacity: 0;
  }
  55%,
  95% {
    opacity: 1;
  }
  100% {
    transform: translateY(155%);
    opacity: 0;
  }
}

@keyframes strata-drift {
  to {
    transform: translateX(44px);
  }
}

@keyframes hero-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(6%, -8%, 0) scale(1.08);
  }
}

.strata {
  background-image: repeating-linear-gradient(
    90deg,
    var(--color-border) 0,
    var(--color-border) 1px,
    transparent 1px,
    transparent 44px
  );
}

.strata-drift {
  animation: strata-drift 14s linear infinite;
}

.hero-scan-x {
  animation: hero-scan-x 18s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.hero-scan-y {
  animation: hero-scan-y 18s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.hero-drift {
  animation: hero-drift 18s ease-in-out infinite;
}

@keyframes hero-carousel-progress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.hero-carousel-progress {
  transform-origin: left;
  animation: hero-carousel-progress 6s linear;
}

@media (prefers-reduced-motion: reduce) {
  .hero-scan-x,
  .hero-scan-y {
    animation: none;
    opacity: 0;
  }
  .strata-drift,
  .hero-drift,
  .hero-carousel-progress {
    animation: none;
  }
}
`

interface FreedomPoint {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: ReactNode
}

const freedoms: Record<Lang, FreedomPoint[]> = {
  python: [
    {
      icon: ListChecks,
      title: "Plain pytest items",
      description: (
        <>
          Every block is collected as an ordinary pytest item:{" "}
          <code className="font-mono text-foreground">-k</code>, node ids, markers,
          plugins and reports work as they do for your test modules.
        </>
      ),
    },
    {
      icon: Terminal,
      title: "Real assertion rewriting",
      description: (
        <>
          Blocks use plain <code className="font-mono text-foreground">assert</code>,
          rewritten by pytest, and a failure points at the very line of the{" "}
          <code className="font-mono text-foreground">.md</code> file.
        </>
      ),
    },
    {
      icon: FileCode,
      title: "Opt in per file",
      description: (
        <>
          List your docs under{" "}
          <code className="font-mono text-foreground">irondocs_files</code> and they run
          with the rest of the suite. See <ConfigurationLink />.
        </>
      ),
    },
  ],
  typescript: [
    {
      icon: ListChecks,
      title: "A plain vite plugin",
      description: (
        <>
          <code className="font-mono text-foreground">irondocs/vite</code> turns each{" "}
          <code className="font-mono text-foreground">.md</code> file into a test module
          that vitest and vite-plus run like any other spec.
        </>
      ),
    },
    {
      icon: Terminal,
      title: "A plain jest transformer",
      description: (
        <>
          <code className="font-mono text-foreground">irondocs/jest</code> registers under{" "}
          <code className="font-mono text-foreground">transform</code>; globals, matchers
          and reporters stay jest's own.
        </>
      ),
    },
    {
      icon: FileCode,
      title: "Opt in per glob",
      description: (
        <>
          Add your docs to <code className="font-mono text-foreground">test.include</code>{" "}
          or <code className="font-mono text-foreground">testMatch</code> and they run
          with the rest of the suite. See <ConfigurationLink />.
        </>
      ),
    },
  ],
}

function ConfigurationLink() {
  const { lang } = useLang()
  return (
    <Link
      to="/$"
      params={{ _splat: `${lang}/configuration` }}
      className="text-primary underline-offset-4 hover:underline"
    >
      Configuration
    </Link>
  )
}

function Freedom() {
  const { lang } = useLang()
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="mb-6">
              <LangTabs />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Still just {langs[lang].runners}
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Irondocs turns marked blocks into tests and gets out of the way. Your{" "}
              {langs[lang].runner} setup and your markdown stay yours.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
          <ul className="space-y-8">
            {freedoms[lang].map((point, i) => (
              <li key={point.title}>
                <Reveal delayMs={i * 60}>
                  <div className="flex gap-4">
                    <div className="shrink-0 inline-flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary">
                      <point.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {point.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                        {point.description}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <Reveal>
            <WindowCard label="mylib">
              <ProjectTree />
            </WindowCard>
            <p className="mt-3 text-center text-sm text-muted-foreground/60">
              Untagged code blocks render as usual and never run.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

const projectTrees: Record<Lang, [string, string, string, string][]> = {
  python: [
    ["", "pyproject.toml", "file", "irondocs_files"],
    ["", "docs/", "dir", ""],
    ["├─ ", "install.md", "file", "1 doctest"],
    ["└─ ", "usage.md", "file", "4 doctests"],
    ["", "tests/", "dir", ""],
    ["└─ ", "test_core.py", "file", "your usual tests"],
  ],
  typescript: [
    ["", "vite.config.ts", "file", "irondocs()"],
    ["", "docs/", "dir", ""],
    ["├─ ", "install.md", "file", "1 doctest"],
    ["└─ ", "usage.md", "file", "4 doctests"],
    ["", "tests/", "dir", ""],
    ["└─ ", "core.test.ts", "file", "your usual tests"],
  ],
}

const projectCommands: Record<Lang, string> = {
  python: "pytest",
  typescript: "pnpm vitest",
}

function ProjectTree() {
  const { lang } = useLang()
  const command = projectCommands[lang]
  const [program, ...args] = command.split(" ")
  return (
    <pre className="p-5 text-sm leading-relaxed font-mono overflow-x-auto">
      <code className={tk.body}>
        {projectTrees[lang].map(([prefix, name, kind, note]) => (
          <span key={name}>
            <span className={tk.dim}>{prefix}</span>
            <span className={kind === "dir" ? tk.flag : tk.type}>{name}</span>
            {note && (
              <span className={cn(tk.dim, "hidden sm:inline")}>
                {`${" ".repeat(Math.max(1, 20 - prefix.length - name.length))}← ${note}`}
              </span>
            )}
            {"\n"}
          </span>
        ))}
        {"\n"}
        <span className={tk.prompt}>$</span> <span className={tk.func}>{program}</span>
        {args.length > 0 && ` ${args.join(" ")}`}
        <span className={cn(tk.dim, "hidden sm:inline")}>
          {`${" ".repeat(Math.max(1, 18 - command.length))}← docs and tests, one run`}
        </span>
      </code>
    </pre>
  )
}

interface Feature {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Zap,
    title: "Zero boilerplate",
    description:
      "Doctest bodies are pure assertions: expect is injected for vitest and jest, and pytest rewrites a plain assert.",
  },
  {
    icon: Layers,
    title: "Every major runner",
    description:
      "One vite plugin for vitest and vite-plus, a jest transformer and a pytest plugin — the same fence and the same names in each.",
  },
  {
    icon: Braces,
    title: "AST-aware imports",
    description:
      "Imports inside a block are hoisted and shared across the file through a real parser — ts-morph or Python's ast, no regex foot-guns.",
  },
  {
    icon: Eye,
    title: "Markdown stays markdown",
    description:
      "The test marker lives in the fence info string, invisible to readers. Your docs site renders normal code blocks.",
  },
  {
    icon: SlidersHorizontal,
    title: "Per-block options",
    description:
      'Use name="...", skip, or only inside the fence to override naming and focus or skip individual doctests.',
  },
  {
    icon: ShieldCheck,
    title: "Docs that cannot lie",
    description:
      "If a snippet stops compiling or asserting, your CI breaks. Docs and code stay in sync by construction.",
  },
]

function Features() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Doctests, the way you wished they worked
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Lean defaults, no setup beyond the plugin, full control when you need it.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delayMs={i * 60}>
              <FeatureCard {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description }: Feature) {
  return (
    <div className="h-full group relative rounded-card border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}

const documents: Record<Lang, string> = {
  python: `## Adds two numbers

\`\`\`python test
from mylib import add

assert add(1, 2) == 3
\`\`\`

## Handles negatives

\`\`\`python test
assert add(-1, -2) == -3
\`\`\``,
  typescript: `## Adds two numbers

\`\`\`ts test
import { add } from "mylib"

expect(add(1, 2)).toBe(3)
\`\`\`

## Handles negatives

\`\`\`ts test
expect(add(-1, -2)).toBe(-3)
\`\`\``,
}

function DocumentSample() {
  const { lang } = useLang()
  return (
    <pre className="p-5 text-sm leading-relaxed font-mono overflow-x-auto">
      <code className={tk.body}>{highlightMarkdown(documents[lang], lang)}</code>
    </pre>
  )
}

const terminals: Record<Lang, string> = {
  python: `$ pytest docs/usage.md -v

docs/usage.md::Adds two numbers PASSED   [ 50%]
docs/usage.md::Handles negatives PASSED  [100%]

============ 2 passed in 0.02s ============`,
  typescript: `$ pnpm vitest run docs/usage.md

 ✓ docs/usage.md (2)
   ✓ Adds two numbers
   ✓ Handles negatives

 Test Files  1 passed (1)
      Tests  2 passed (2)`,
}

function TerminalSample() {
  const { lang } = useLang()
  return (
    <pre className="p-5 text-sm leading-relaxed font-mono overflow-x-auto">
      <code className={tk.body}>{highlightTerminal(terminals[lang])}</code>
    </pre>
  )
}

function highlightTerminal(terminal: string) {
  return terminal.split("\n").map((line, i) => (
    <span key={i}>
      {line.startsWith("$ ") ? (
        highlightCommand(line)
      ) : line.startsWith("E ") || line.startsWith("> ") ? (
        <span className={tk.prompt}>{line}</span>
      ) : (
        highlightOutput(line)
      )}
      {"\n"}
    </span>
  ))
}

const COMMAND_TOKEN = /(^\$)|('[^']*')|(--?[\w-]+)|((?<=^\$ )\S+)|(\s+|\S+)/g

function highlightCommand(line: string) {
  return [...line.matchAll(COMMAND_TOKEN)].map(match => {
    const [text, prompt, string, flag, program] = match
    const className = prompt
      ? tk.prompt
      : string
        ? tk.string
        : flag
          ? tk.flag
          : program
            ? tk.func
            : undefined
    return className ? (
      <span key={match.index} className={className}>
        {text}
      </span>
    ) : (
      text
    )
  })
}

const OUTPUT_TOKEN =
  /(✓|\bPASS(?:ED)?\b|\b\d+ passed\b)|(↓|○ skipped|\bSKIPPED\b|\b\d+ skipped\b)|(\bFAIL(?:ED)?\b|\b\d+ failed\b|\bAssertionError\b)|(`{3}.*)|([\w/-]+\.md(?::\d+)?)|(\[\s*\d+%\]|\(\d+(?: ms)?\)|={3,}|_{3,}|\bin \d+\.\d+s\b)|(\s+|[\s\S])/g

function highlightOutput(line: string) {
  return [...line.matchAll(OUTPUT_TOKEN)].map(match => {
    const [text, pass, skip, fail, fence, path, dim] = match
    const className = pass
      ? tk.pass
      : skip
        ? tk.skip
        : fail
          ? tk.prompt
          : fence
            ? tk.flag
            : path
              ? tk.key
              : dim
                ? tk.dim
                : undefined
    return className ? (
      <span key={match.index} className={className}>
        {text}
      </span>
    ) : (
      text
    )
  })
}

function Showcase() {
  const { lang } = useLang()
  return (
    <section className="border-b border-border bg-primary/5">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="mb-6">
              <LangTabs />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Write a doctest. Get a test.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Tag a <code className="font-mono">{langs[lang].fence}</code> fence with{" "}
              <code className="font-mono">test</code> and its body runs as a{" "}
              {langs[lang].runner} test named after the nearest heading.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <WindowCard label="docs/usage.md">
              <DocumentSample />
            </WindowCard>
            <WindowCard label="terminal">
              <TerminalSample />
            </WindowCard>
          </div>
        </Reveal>
        <Reveal delayMs={120}>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Bullet text="Test names come from the nearest heading, suffixed #1, #2 on repeats." />
            <Bullet text="Imports hoist across the file; everything else stays local to its block." />
            <Bullet
              text={`Runs with ${langs[lang].runners}, filtered and reported as usual.`}
            />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-primary/20 bg-card/60 p-4">
      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
      <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>
    </div>
  )
}

function WindowCard(props: { label: string; children: ReactNode }) {
  return (
    <div className="h-full rounded-card border border-primary/20 bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2 bg-muted/50">
        <div className="size-2.5 rounded-full bg-red-400/60" />
        <div className="size-2.5 rounded-full bg-yellow-400/60" />
        <div className="size-2.5 rounded-full bg-green-400/60" />
        <span className="ml-2 text-xs font-mono text-muted-foreground">
          {props.label}
        </span>
      </div>
      {props.children}
    </div>
  )
}

function FinalCta() {
  const { lang } = useLang()
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
        <Reveal>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Stop writing docs that lie.{" "}
            <span className="text-primary">Make them tests.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Install, mark a fence, run your usual test command. That's it.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/$"
              params={{ _splat: `${lang}/introduction` }}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "px-5 no-underline",
              )}
            >
              <BookOpen className="size-4" />
              Read the docs
            </Link>
            <Link
              to="/$"
              params={{ _splat: `${lang}/options` }}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "px-5 no-underline",
              )}
            >
              See block options
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Datist() {
  return (
    <section className="border-t border-border bg-muted">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Built by
            </p>
            <a
              href="https://datist.io"
              target="_blank"
              rel="noopener"
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors no-underline"
            >
              Datist — Software development, end to end.
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Reveal(props: { children: ReactNode; delayMs?: number }) {
  const { ref, isVisible } = useInView()
  return (
    <div
      ref={ref as (node: HTMLDivElement | null) => void}
      style={{ transitionDelay: `${props.delayMs ?? 0}ms` }}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      {props.children}
    </div>
  )
}
