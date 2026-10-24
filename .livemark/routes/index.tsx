import { Link, createFileRoute } from "@tanstack/react-router"
import {
  ArrowRight,
  BookOpenCheck,
  Braces,
  Eye,
  Github,
  Layers,
  ShieldCheck,
  SlidersHorizontal,
  Zap,
} from "lucide-react"
import type { ComponentType, ReactNode, SVGProps } from "react"
import { buttonVariants } from "livemark/elements/button"
import { useInView } from "livemark/hooks/in-view"
import { cn } from "cn"

export const Route = createFileRoute("/")({
  component: Landing,
})

function Landing() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <Showcase />
      <FinalCta />
      <Datist />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border flex items-center min-h-[calc(100vh-4rem)]">
      <BackgroundGrid />
      <div className="relative w-full mx-auto max-w-5xl px-6 py-16 text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-700 ease-out">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
          Docs that run in your{" "}
          <span className="relative inline-block">
            <span className="relative z-10">test suite</span>
            <span
              aria-hidden
              className="absolute left-0 right-0 bottom-1 md:bottom-2 h-3 md:h-4 bg-primary/20 -z-0 rounded"
            />
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Mark a TypeScript code block in any <code>.md</code> file. Irondocs lifts it
          into a real vitest or jest test — no separate spec file, no boilerplate.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/introduction/"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "px-5 no-underline",
            )}
          >
            Get started
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://github.com/datisthq/irondocs"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "px-5 no-underline",
            )}
          >
            <Github className="size-4" />
            View source
          </a>
        </div>

        <div className="mt-10 hidden sm:inline-flex items-center gap-3 rounded-lg border border-border bg-card/50 backdrop-blur px-4 py-2.5 font-mono text-sm text-muted-foreground">
          <span className="text-primary select-none">$</span>
          <span>
            <span className="text-foreground">npm install </span> irondocs
          </span>
        </div>
      </div>
    </section>
  )
}

function BackgroundGrid() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 [background-image:repeating-linear-gradient(90deg,var(--color-border)_0,var(--color-border)_1px,transparent_1px,transparent_8px)] opacity-25 [mask-image:linear-gradient(to_top,black_10%,transparent_85%)]"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-primary/30 dark:bg-primary/25 blur-[110px] pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-lime-400/30 dark:bg-lime-500/25 blur-[110px] pointer-events-none"
      />
    </>
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
      "describe, it, and expect are injected for you. Doctest bodies are pure assertions — no framework imports.",
  },
  {
    icon: Layers,
    title: "Multi-runner",
    description:
      "One vite plugin works for vitest and vite-plus. A sibling jest transformer covers jest projects.",
  },
  {
    icon: Braces,
    title: "AST-aware imports",
    description:
      "Multi-line and type-only imports inside a block are hoisted to module scope via ts-morph — no regex foot-guns.",
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
    <div className="h-full group relative rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="inline-flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/15 transition-colors">
        <Icon className="size-5" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
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
  pass: "text-[#40a02b] dark:text-[#a6e3a1]",
  heading: "text-[#1e66f5] dark:text-[#89b4fa]",
}

function MarkdownSample() {
  return (
    <pre className="p-5 text-sm leading-relaxed font-mono overflow-x-auto">
      <code className={tk.body}>
        <span className={tk.heading}>## Adds two numbers</span>
        {"\n\n"}
        <span className={tk.punct}>```</span>
        <span className={tk.flag}>ts test</span>
        {"\n"}
        <span className={tk.keyword}>import</span>{" "}
        <span className={tk.punct}>{"{ "}</span>
        <span className={tk.func}>sum</span>
        <span className={tk.punct}>{" } "}</span>
        <span className={tk.keyword}>from</span>{" "}
        <span className={tk.string}>{`"./sum.ts"`}</span>
        {"\n"}
        <span className={tk.func}>expect</span>
        <span className={tk.punct}>(</span>
        <span className={tk.func}>sum</span>
        <span className={tk.punct}>(</span>
        <span className={tk.type}>1</span>
        <span className={tk.punct}>, </span>
        <span className={tk.type}>2</span>
        <span className={tk.punct}>{"))."}</span>
        <span className={tk.func}>toBe</span>
        <span className={tk.punct}>(</span>
        <span className={tk.type}>3</span>
        <span className={tk.punct}>)</span>
        {"\n"}
        <span className={tk.punct}>```</span>
      </code>
    </pre>
  )
}

function TerminalSample() {
  return (
    <pre className="p-5 text-sm leading-relaxed font-mono overflow-x-auto">
      <code className={tk.body}>
        <span className={tk.prompt}>$</span> <span className={tk.func}>pnpm</span> test
        {"\n\n "}
        <span className={tk.pass}>✓</span> docs/sum.md <span className={tk.dim}>(1)</span>
        {"\n   "}
        <span className={tk.pass}>✓</span> Adds two numbers
        {"\n\n "}
        <span className={tk.dim}>Test Files</span>{" "}
        <span className={tk.pass}>1 passed</span> (1)
        {"\n      "}
        <span className={tk.dim}>Tests</span> <span className={tk.pass}>1 passed</span>{" "}
        (1)
      </code>
    </pre>
  )
}

function Showcase() {
  return (
    <section className="border-b border-border bg-primary/5">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Write a doctest. Get a test.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Tag a fence with <code className="font-mono">test</code> and the block's
              body becomes the body of an <code className="font-mono">it()</code>.
            </p>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2 bg-muted/50">
                <div className="size-2.5 rounded-full bg-red-400/60" />
                <div className="size-2.5 rounded-full bg-yellow-400/60" />
                <div className="size-2.5 rounded-full bg-green-400/60" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">
                  docs/sum.md
                </span>
              </div>
              <MarkdownSample />
            </div>
            <div className="rounded-xl border border-primary/20 bg-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-primary/20 px-4 py-2 bg-muted/50">
                <div className="size-2.5 rounded-full bg-red-400/60" />
                <div className="size-2.5 rounded-full bg-yellow-400/60" />
                <div className="size-2.5 rounded-full bg-green-400/60" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">
                  pnpm test
                </span>
              </div>
              <TerminalSample />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function FinalCta() {
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
              to="/writing-tests/"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "px-5 no-underline",
              )}
            >
              Read the docs
              <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/configuration/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "px-5 no-underline",
              )}
            >
              See setup
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Datist() {
  return (
    <section className="border-t border-border">
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
