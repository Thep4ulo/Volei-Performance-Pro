import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ClerkProvider,
  Show,
  SignIn,
  SignUp,
  useAuth,
  useClerk,
  useUser,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  Dumbbell,
  FileBarChart,
  Filter,
  Gauge,
  Grid2X2,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Trophy,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import {
  getGetAthleteComparisonQueryKey,
  getGetAthleteQueryKey,
  getGetAthletesQueryKey,
  getGetDashboardActivityQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetMatchesQueryKey,
  getGetReportsQueryKey,
  getGetScoutEventsQueryKey,
  getGetTacticalSummaryQueryKey,
  getGetTrainingSessionsQueryKey,
  useCreateAthlete,
  useCreateMatch,
  useCreateReport,
  useCreateScoutEvent,
  useCreateTrainingSession,
  useDeleteAthlete,
  useGetAthlete,
  useGetAthleteComparison,
  useGetAthletes,
  useGetDashboardActivity,
  useGetDashboardSummary,
  useGetMatches,
  useGetReports,
  useGetScoutEvents,
  useGetTacticalSummary,
  useGetTrainingSessions,
  useUpdateAthlete,
  useUpdateMatch,
} from "@workspace/api-client-react";
import {
  Redirect,
  Route,
  Switch,
  Link,
  Router as WouterRouter,
  useLocation,
  useParams,
} from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string) {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function cn(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

function safeDate(value?: string) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value?: string) {
  const date = safeDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatFullDate(value?: string) {
  const date = safeDate(value);

  if (!date) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function IconMark() {
  return (
    <div
      className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--sidebar))] shadow-sm"
      data-testid="brand-mark"
    >
      <span className="absolute h-5 w-5 rounded-full border-[2px] border-current" />
      <span className="absolute h-5 w-5 rotate-45 rounded-full border-[2px] border-current" />
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const displayName = user?.fullName || user?.firstName || "Usuário Vôlei Pro";
  const initials = (
    displayName
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "VP"
  ).toUpperCase();
  const nav = [
    { href: "/", label: "Visão geral", icon: LayoutDashboard },
    { href: "/athletes", label: "Atletas", icon: UsersRound },
    { href: "/matches", label: "Partidas", icon: Trophy },
    { href: "/training", label: "Treinos", icon: Dumbbell },
    { href: "/analysis", label: "Análise", icon: Grid2X2 },
    { href: "/reports", label: "Relatórios", icon: FileBarChart },
  ];
  return (
    <div className="min-h-[100dvh] bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        data-testid="sidebar"
      >
        <div className="flex items-center gap-3 px-2">
          <IconMark />
          <div>
            <p className="font-[var(--app-font-sans)] text-[15px] font-extrabold tracking-tight">
              Vôlei <span className="text-sidebar-primary">Pro</span>
            </p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[.22em] text-sidebar-foreground/50">
              Performance intelligence
            </p>
          </div>
        </div>
        <div className="mt-10 px-2 font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/45">
          Workspace
        </div>
        <nav className="mt-3 space-y-1" aria-label="Navegação principal">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
                data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <Icon size={17} strokeWidth={active ? 2.4 : 1.8} />
                <span>{item.label}</span>
                {active && <ChevronRight className="ml-auto" size={14} />}
              </Link>
            );
          })}
        </nav>
        <div className="mt-9 px-2 font-mono text-[9px] uppercase tracking-[.18em] text-sidebar-foreground/45">
          Clube
        </div>
        <nav className="mt-3 space-y-1">
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
              location === "/settings"
                ? "bg-sidebar-accent text-sidebar-foreground"
                : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            )}
            data-testid="link-nav-configuracoes"
          >
            <Settings2 size={17} />
            <span>Configurações</span>
          </Link>
        </nav>
        <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary font-mono text-xs font-bold text-sidebar-primary-foreground">
              PN
            </div>
            <div>
              <p className="text-xs font-bold">Praia Norte Vôlei</p>
              <p className="text-[10px] text-sidebar-foreground/50">
                Plano profissional
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-sidebar-foreground/55">
            <ShieldCheck size={13} className="text-sidebar-primary" /> Dados
            protegidos e sincronizados
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 bg-sidebar/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Fechar menu"
          data-testid="button-close-menu"
        />
      )}
      <main className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 hover:bg-muted lg:hidden"
              onClick={() => setMobileOpen(true)}
              data-testid="button-open-menu"
            >
              <Menu size={19} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span>Temporada 2024/25</span>
              <span className="text-border">/</span>
              <span className="font-semibold text-foreground">
                Adulto feminino
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              data-testid="button-notificacoes"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" />
            </button>
            <div className="hidden h-7 w-px bg-border sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-medium text-primary-foreground">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold leading-tight">{displayName}</p>
                <p className="text-[10px] text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress ??
                    "Usuário autenticado"}
                </p>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
                className="hidden rounded-lg px-2 py-1.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground sm:block"
                data-testid="button-logout"
              >
                Sair
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[.2em] text-primary/65">
          {eyebrow}
        </p>
        <h1 className="mt-2 font-[var(--app-font-sans)] text-3xl font-extrabold tracking-[-.045em] text-foreground sm:text-[34px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  disabled = false,
  testId,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  testId: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:brightness-110",
        variant === "secondary" &&
          "border border-border bg-card text-foreground hover:bg-muted",
        variant === "ghost" &&
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "danger" &&
          "border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10",
        className,
      )}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

function MetricCard({
  label,
  value,
  unit,
  detail,
  trend,
  icon: Icon,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
  trend?: number;
  icon: typeof Activity;
  accent?: "primary" | "gold" | "mint" | "rose";
}) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    gold: "bg-accent/20 text-accent-foreground",
    mint: "bg-[hsl(162_45%_38%/_.12)] text-[hsl(162_45%_30%)]",
    rose: "bg-destructive/10 text-destructive",
  };
  return (
    <div
      className="rounded-2xl border border-card-border bg-card p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
      data-testid={`metric-card-${label.toLowerCase().replaceAll(" ", "-")}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[.08em] text-muted-foreground">
          {label}
        </p>
        <div className={cn("rounded-lg p-2", colors[accent])}>
          <Icon size={16} />
        </div>
      </div>
      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-[var(--app-font-sans)] text-[29px] font-extrabold tracking-[-.06em]">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[11px]">
        {trend !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 font-bold",
              trend >= 0 ? "text-[hsl(162_45%_32%)]" : "text-destructive",
            )}
          >
            {trend >= 0 ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="text-muted-foreground">{detail}</span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  eyebrow,
  action,
  children,
  className = "",
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-card-border bg-card shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          {eyebrow && (
            <p className="font-mono text-[9px] uppercase tracking-[.16em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <h2 className="mt-0.5 text-sm font-extrabold tracking-[-.02em]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-5" data-testid="loading-state">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton h-12 rounded-xl" />
      ))}
    </div>
  );
}
function ErrorBlock({ onRetry }: { onRetry?: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-10 text-center"
      data-testid="error-state"
    >
      <div className="rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertTriangle size={20} />
      </div>
      <div>
        <p className="text-sm font-bold">Não foi possível carregar os dados</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Verifique a conexão e tente novamente.
        </p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} testId="button-retry">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
function EmptyBlock({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center p-12 text-center"
      data-testid="empty-state"
    >
      <div className="rounded-2xl bg-muted p-3 text-primary">
        <ClipboardList size={22} />
      </div>
      <p className="mt-4 text-sm font-extrabold">{title}</p>
      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function TrendChart({
  values,
}: {
  values: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...values.map((v) => v.value), 1);
  const min = Math.min(...values.map((v) => v.value), 0);
  const range = Math.max(max - min, 1);
  const points = values
    .map(
      (v, i) =>
        `${(i / Math.max(values.length - 1, 1)) * 100},${100 - ((v.value - min) / range) * 74 - 12}`,
    )
    .join(" ");
  return (
    <div className="px-5 pb-5 pt-6">
      <div className="relative h-[178px] data-grid rounded-xl border border-border/70 px-2">
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <polyline
            points={points}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={`0,100 ${points} 100,100`}
            fill="hsl(var(--primary) / .08)"
            stroke="none"
          />
        </svg>
        {values.map((v, i) => (
          <div
            key={v.label}
            className="absolute bottom-[-22px] text-[10px] font-mono text-muted-foreground"
            style={{
              left: `${(i / Math.max(values.length - 1, 1)) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            {v.label}
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Desempenho médio</span>
        <span className="font-mono">últimas 7 semanas</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const summaryQuery = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });
  const activityQuery = useGetDashboardActivity({
    query: { queryKey: getGetDashboardActivityQueryKey() },
  });
  if (summaryQuery.isLoading || activityQuery.isLoading)
    return <LoadingBlock rows={7} />;
  if (summaryQuery.isError || !summaryQuery.data)
    return (
      <ErrorBlock
        onRetry={() => {
          summaryQuery.refetch();
          activityQuery.refetch();
        }}
      />
    );
  const summary = summaryQuery.data;
  const activity = activityQuery.data ?? [];
  return (
    <>
      <PageTitle
        eyebrow="Quarta-feira · 26 fevereiro 2025"
        title="Bom dia, Diego."
        description="Aqui está o pulso da equipe antes da próxima sessão."
        actions={
          <>
            <Button variant="secondary" testId="button-dashboard-period">
              <CalendarDays size={15} /> Últimos 7 dias
            </Button>
            <Button testId="button-dashboard-report">
              <FileBarChart size={15} /> Novo relatório
            </Button>
          </>
        }
      />
      <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Performance média"
          value={summary.averagePerformance.toFixed(1)}
          unit="/100"
          detail="vs. período anterior"
          trend={3.8}
          icon={Gauge}
          accent="primary"
        />
        <MetricCard
          label="Eficiência de ataque"
          value={`${summary.attackEfficiency.toFixed(1)}`}
          unit="%"
          detail="média da equipe"
          trend={2.4}
          icon={Zap}
          accent="gold"
        />
        <MetricCard
          label="Carga semanal"
          value={summary.weeklyLoad.toLocaleString("pt-BR")}
          unit="UA"
          detail="dentro da faixa ideal"
          icon={Activity}
          accent="mint"
        />
        <MetricCard
          label="Índice de fadiga"
          value={summary.fatigueIndex.toFixed(1)}
          unit="/100"
          detail="monitorar 3 atletas"
          trend={-5.1}
          icon={HeartPulse}
          accent="rose"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title="Evolução de performance"
          eyebrow="Tendência da equipe"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[hsl(162_45%_32%)]">
              <TrendingUp size={14} /> +3,8% no período
            </span>
          }
        >
          <TrendChart values={summary.performanceTrend} />
        </SectionCard>
        <SectionCard
          title="Atividade recente"
          eyebrow="Feed do workspace"
          action={
            <Button
              variant="ghost"
              className="px-2 py-1.5 text-[11px]"
              testId="button-view-activity"
            >
              Ver tudo <ChevronRight size={13} />
            </Button>
          }
        >
          {activityQuery.isLoading ? (
            <LoadingBlock />
          ) : activityQuery.isError ? (
            <ErrorBlock onRetry={() => activityQuery.refetch()} />
          ) : (
            <div className="divide-y divide-border/70">
              {activity.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 px-5 py-4"
                  data-testid={`activity-item-${item.id}`}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      item.accent === "gold"
                        ? "bg-accent/20 text-accent-foreground"
                        : item.accent === "mint"
                          ? "bg-[hsl(162_45%_38%/_.12)] text-[hsl(162_45%_30%)]"
                          : item.accent === "violet"
                            ? "bg-[hsl(270_30%_55%/_.13)] text-[hsl(270_30%_45%)]"
                            : "bg-primary/10 text-primary",
                    )}
                  >
                    <Activity size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{item.title}</p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 pt-0.5 font-mono text-[9px] text-muted-foreground">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_1.1fr]">
        <SectionCard title="Indicadores de jogo" eyebrow="Último recorte">
          <div className="grid grid-cols-3 divide-x divide-border/70 px-2 py-6">
            {[
              ["Side-out", summary.sideOut, "%"],
              ["Recepção", summary.receptionEfficiency, "%"],
              ["Break point", 28.4, "%"],
            ].map(([label, value, unit]) => (
              <div key={String(label)} className="px-3 text-center">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-extrabold tracking-[-.06em]">
                  {Number(value).toFixed(1)}
                  <span className="ml-0.5 text-sm font-semibold text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Distribuição por posição" eyebrow="Elenco ativo">
          <div className="space-y-3 px-5 py-5">
            {summary.positionDistribution.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-[11px]">
                  <span className="font-semibold">{item.label}</span>
                  <span className="font-mono text-muted-foreground">
                    {item.value}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(Number(item.value) * 14, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Próximo compromisso" eyebrow="Agenda da equipe">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">
                  Superliga B · rodada 14
                </p>
                <p className="mt-2 text-base font-extrabold">
                  Praia Norte{" "}
                  <span className="mx-1 text-muted-foreground">×</span> Sesi
                  Bauru
                </p>
              </div>
              <div className="rounded-xl bg-primary px-3 py-2 text-center text-primary-foreground">
                <p className="font-mono text-[10px]">MAR</p>
                <p className="text-xl font-extrabold">08</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock3 size={14} /> 19:30 · Arena Praia Norte
            </div>
            <Link
              href="/matches"
              className="mt-5 flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-xs font-bold hover:bg-muted"
              data-testid="link-next-match"
            >
              Abrir preparação <ChevronRight size={14} />
            </Link>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function AthleteModal({
  athlete,
  onClose,
}: {
  athlete?: any;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const create = useCreateAthlete();
  const update = useUpdateAthlete();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: athlete?.name ?? "",
    birthDate: athlete?.birthDate ?? "2000-01-01",
    height: athlete?.height ?? 180,
    weight: athlete?.weight ?? 70,
    position: athlete?.position ?? "Ponteiro",
    dominantHand: athlete?.dominantHand ?? "Direita",
    jerseyNumber: athlete?.jerseyNumber ?? 1,
    team: athlete?.team ?? "Adulto feminino",
  });
  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Informe o nome do atleta.");
      return;
    }
    const payload = {
      ...form,
      height: Number(form.height),
      weight: Number(form.weight),
      jerseyNumber: Number(form.jerseyNumber),
    } as any;
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getGetAthletesQueryKey() });
      if (athlete)
        queryClient.invalidateQueries({
          queryKey: getGetAthleteQueryKey(athlete.id),
        });
      onClose();
    };
    if (athlete)
      update.mutate({ id: athlete.id, data: payload }, { onSuccess });
    else create.mutate({ data: payload }, { onSuccess });
  };
  const pending = create.isPending || update.isPending;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/50 p-0 sm:items-center sm:p-5">
      <div
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-card p-6 shadow-[var(--shadow-lg)] sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        data-testid="athlete-modal"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary/60">
              {athlete ? "Editar cadastro" : "Novo cadastro"}
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              {athlete ? athlete.name : "Adicionar atleta"}
            </h2>
          </div>
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            data-testid="button-close-athlete-modal"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Nome completo</span>
            <input
              className="field-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              data-testid="input-athlete-name"
            />
          </label>
          <label>
            <span className="field-label">Nascimento</span>
            <input
              type="date"
              className="field-input"
              value={form.birthDate}
              onChange={(e) => set("birthDate", e.target.value)}
              data-testid="input-athlete-birth-date"
            />
          </label>
          <label>
            <span className="field-label">Número da camisa</span>
            <input
              type="number"
              className="field-input"
              value={form.jerseyNumber}
              onChange={(e) => set("jerseyNumber", e.target.value)}
              data-testid="input-athlete-jersey-number"
            />
          </label>
          <label>
            <span className="field-label">Posição</span>
            <select
              className="field-input"
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              data-testid="select-athlete-position"
            >
              {["Levantador", "Ponteiro", "Oposto", "Central", "Líbero"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </label>
          <label>
            <span className="field-label">Mão dominante</span>
            <select
              className="field-input"
              value={form.dominantHand}
              onChange={(e) => set("dominantHand", e.target.value)}
              data-testid="select-athlete-hand"
            >
              <option>Direita</option>
              <option>Esquerda</option>
            </select>
          </label>
          <label>
            <span className="field-label">
              Altura <span>(cm)</span>
            </span>
            <input
              type="number"
              className="field-input"
              value={form.height}
              onChange={(e) => set("height", e.target.value)}
              data-testid="input-athlete-height"
            />
          </label>
          <label>
            <span className="field-label">
              Peso <span>(kg)</span>
            </span>
            <input
              type="number"
              className="field-input"
              value={form.weight}
              onChange={(e) => set("weight", e.target.value)}
              data-testid="input-athlete-weight"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="field-label">Equipe</span>
            <input
              className="field-input"
              value={form.team}
              onChange={(e) => set("team", e.target.value)}
              data-testid="input-athlete-team"
            />
          </label>
          {error && (
            <p
              className="sm:col-span-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
              data-testid="text-athlete-form-error"
            >
              {error}
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <Button
              variant="secondary"
              onClick={onClose}
              testId="button-cancel-athlete"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={pending}
              testId="button-save-athlete"
            >
              {pending ? (
                "Salvando…"
              ) : (
                <>
                  <Check size={15} /> Salvar atleta
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AthleteAvatar({
  athlete,
  large = false,
}: {
  athlete: any;
  large?: boolean;
}) {
  return athlete.photoUrl ? (
    <img
      src={athlete.photoUrl}
      alt={athlete.name}
      className={cn(
        "rounded-full object-cover",
        large ? "h-16 w-16" : "h-10 w-10",
      )}
      data-testid={`img-athlete-${athlete.id}`}
    />
  ) : (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono font-medium text-primary",
        large ? "h-16 w-16 text-lg" : "h-10 w-10 text-xs",
      )}
      data-testid={`avatar-athlete-${athlete.id}`}
    >
      {athlete.initials}
    </div>
  );
}

function Athletes() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("Todas");
  const [modal, setModal] = useState<{ open: boolean; athlete?: any }>({
    open: false,
  });
  const [notice, setNotice] = useState("");
  const query = useGetAthletes(
    {
      search: search || undefined,
      position: position === "Todas" ? undefined : position,
    },
    {
      query: {
        queryKey: getGetAthletesQueryKey({
          search: search || undefined,
          position: position === "Todas" ? undefined : position,
        }),
      },
    },
  );
  const remove = useDeleteAthlete();
  const athletes = (query.data ?? []).filter(
    (a: any) =>
      a.name.toLowerCase().includes(search.toLowerCase()) &&
      (position === "Todas" || a.position === position),
  );
  const deleteOne = (athlete: any) => {
    if (window.confirm(`Remover ${athlete.name} do elenco?`))
      remove.mutate(
        { id: athlete.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: getGetAthletesQueryKey(),
            });
            setNotice("Atleta removido do elenco.");
          },
        },
      );
  };
  return (
    <>
      <PageTitle
        eyebrow="Elenco · 18 atletas"
        title="Atletas"
        description="Acompanhe a prontidão individual e mantenha o cadastro do elenco em dia."
        actions={
          <Button
            onClick={() => setModal({ open: true })}
            testId="button-new-athlete"
          >
            <Plus size={16} /> Adicionar atleta
          </Button>
        }
      />
      {notice && (
        <div
          className="mb-4 flex items-center justify-between rounded-xl border border-[hsl(162_45%_38%/_.2)] bg-[hsl(162_45%_38%/_.08)] px-4 py-3 text-xs font-semibold text-[hsl(162_45%_30%)]"
          data-testid="status-athlete-success"
        >
          {notice}
          <button
            onClick={() => setNotice("")}
            data-testid="button-dismiss-notice"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
          <input
            className="field-input h-11 pl-9"
            placeholder="Buscar por nome…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-athletes"
          />
        </div>
        <div className="relative">
          <Filter
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={14}
          />
          <select
            className="field-input h-11 min-w-[180px] pl-9"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            data-testid="select-filter-position"
          >
            <option>Todas</option>
            {["Ponteiro", "Levantador", "Oposto", "Central", "Líbero"].map(
              (v) => (
                <option key={v}>{v}</option>
              ),
            )}
          </select>
        </div>
      </div>
      <SectionCard
        title="Elenco ativo"
        eyebrow={`${athletes.length} resultados`}
        action={
          <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
            atualizado há 4 min
          </span>
        }
      >
        {query.isLoading ? (
          <LoadingBlock rows={5} />
        ) : query.isError ? (
          <ErrorBlock onRetry={() => query.refetch()} />
        ) : athletes.length === 0 ? (
          <EmptyBlock
            title="Nenhum atleta encontrado"
            description="Tente outro nome ou ajuste o filtro de posição."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[.1em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-bold">Atleta</th>
                  <th className="px-4 py-3 font-bold">Posição</th>
                  <th className="px-4 py-3 font-bold">Status</th>
                  <th className="px-4 py-3 font-bold">Performance</th>
                  <th className="px-4 py-3 font-bold">Tendência</th>
                  <th className="px-5 py-3 text-right font-bold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {athletes.map((athlete: any) => (
                  <tr
                    key={athlete.id}
                    className="group transition-colors hover:bg-muted/30"
                    data-testid={`row-athlete-${athlete.id}`}
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/athletes/${athlete.id}`}
                        className="flex items-center gap-3"
                        data-testid={`link-athlete-${athlete.id}`}
                      >
                        <AthleteAvatar athlete={athlete} />
                        <div>
                          <p className="text-xs font-extrabold">
                            {athlete.name}
                          </p>
                          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            #{String(athlete.jerseyNumber).padStart(2, "0")} ·{" "}
                            {athlete.team}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold">
                      {athlete.position}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
                          athlete.status === "Ativo"
                            ? "bg-[hsl(162_45%_38%/_.11)] text-[hsl(162_45%_30%)]"
                            : athlete.status === "Em recuperação"
                              ? "bg-accent/20 text-accent-foreground"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {athlete.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${athlete.performance}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-medium">
                          {athlete.performance.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-bold",
                          athlete.trend >= 0
                            ? "text-[hsl(162_45%_32%)]"
                            : "text-destructive",
                        )}
                      >
                        {athlete.trend >= 0 ? (
                          <ArrowUpRight size={13} />
                        ) : (
                          <ArrowDownRight size={13} />
                        )}
                        {Math.abs(athlete.trend).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          className="p-2"
                          onClick={() => setModal({ open: true, athlete })}
                          testId={`button-edit-athlete-${athlete.id}`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          className="p-2 text-destructive hover:text-destructive"
                          onClick={() => deleteOne(athlete)}
                          disabled={remove.isPending}
                          testId={`button-delete-athlete-${athlete.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      {modal.open && (
        <AthleteModal
          athlete={modal.athlete}
          onClose={() => setModal({ open: false })}
        />
      )}
    </>
  );
}

function AthleteProfile() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const query = useGetAthlete(id, {
    query: { enabled: !!id, queryKey: getGetAthleteQueryKey(id) },
  });
  const athlete: any = query.data;
  if (query.isLoading) return <LoadingBlock rows={7} />;
  if (query.isError || !athlete)
    return <ErrorBlock onRetry={() => query.refetch()} />;
  const metrics = Object.entries(athlete.metrics ?? {}) as Array<
    [string, number]
  >;
  const labels: Record<string, string> = {
    attack: "Ataque",
    serve: "Saque",
    block: "Bloqueio",
    reception: "Recepção",
    defense: "Defesa",
    setting: "Levantamento",
  };
  return (
    <>
      <Link
        href="/athletes"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
        data-testid="link-back-athletes"
      >
        ← Voltar para atletas
      </Link>
      <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <AthleteAvatar athlete={athlete} large />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-[-.05em]">
                {athlete.name}
              </h1>
              <span className="rounded-full bg-[hsl(162_45%_38%/_.11)] px-2.5 py-1 text-[10px] font-bold text-[hsl(162_45%_30%)]">
                {athlete.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              #{String(athlete.jerseyNumber).padStart(2, "0")} ·{" "}
              {athlete.position} · {athlete.team}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" testId="button-export-athlete">
            <FileBarChart size={15} /> Exportar ficha
          </Button>
          <Button testId="button-edit-profile">
            <Pencil size={15} /> Editar perfil
          </Button>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.1fr_1.6fr]">
        <SectionCard title="Resumo físico" eyebrow="Dados de cadastro">
          <div className="grid grid-cols-2 divide-x divide-y divide-border/70 sm:grid-cols-4 sm:divide-y-0">
            {[
              ["Altura", `${athlete.height}`, "cm"],
              ["Peso", `${athlete.weight}`, "kg"],
              ["Mão dominante", athlete.dominantHand, ""],
              ["Nascimento", formatDate(athlete.birthDate), ""],
            ].map(([label, value, unit]) => (
              <div key={label} className="p-5">
                <p className="font-mono text-[9px] uppercase tracking-[.12em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-2 text-base font-extrabold">
                  {value}{" "}
                  <span className="text-xs font-medium text-muted-foreground">
                    {unit}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard
          title="Performance técnica"
          eyebrow="Última atualização · 19 fev 2025"
          action={
            <span className="font-mono text-xs font-bold text-primary">
              {athlete.performance.toFixed(1)} / 100
            </span>
          }
        >
          <div className="grid gap-x-8 gap-y-5 px-5 py-6 sm:grid-cols-2">
            {metrics.map(([key, value]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-bold">{labels[key] ?? key}</span>
                  <span className="font-mono text-muted-foreground">
                    {value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <SectionCard title="Evolução no período" eyebrow="Performance composta">
          <TrendChart
            values={[
              { label: "Out", value: 73 },
              { label: "Nov", value: 76 },
              { label: "Dez", value: 78 },
              { label: "Jan", value: 81 },
              { label: "Fev", value: athlete.performance },
            ]}
          />
        </SectionCard>
        <SectionCard title="Histórico recente" eyebrow="Atividade individual">
          <div className="divide-y divide-border/70">
            {[
              "Avaliação técnica registrada",
              "Participação em partida",
              "Sessão de força concluída",
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-3 px-5 py-4">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <Check size={14} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold">{item}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatFullDate(`2025-02-${19 - i * 3}`)}
                  </p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function MatchModal({ match, onClose }: { match?: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const create = useCreateMatch();
  const update = useUpdateMatch();
  const [form, setForm] = useState({
    opponent: match?.opponent ?? "",
    date: match?.date ?? "2025-03-15",
    championship: match?.championship ?? "Superliga B",
    location: match?.location ?? "Arena Praia Norte",
    result: match?.result ?? "Vitória",
    setsWon: match?.setsWon ?? 3,
    setsLost: match?.setsLost ?? 0,
  });
  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      setsWon: Number(form.setsWon),
      setsLost: Number(form.setsLost),
    } as any;
    const success = () => {
      queryClient.invalidateQueries({ queryKey: getGetMatchesQueryKey() });
      onClose();
    };
    if (match)
      update.mutate({ id: match.id, data: payload }, { onSuccess: success });
    else create.mutate({ data: payload }, { onSuccess: success });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/50 p-0 sm:items-center sm:p-5">
      <div className="w-full max-w-xl rounded-t-3xl bg-card p-6 shadow-[var(--shadow-lg)] sm:rounded-3xl">
        <div className="flex justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary/60">
              Registro de partida
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              {match ? "Editar partida" : "Nova partida"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            data-testid="button-close-match-modal"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="field-label">Adversário</span>
            <input
              required
              className="field-input"
              value={form.opponent}
              onChange={(e) => set("opponent", e.target.value)}
              data-testid="input-match-opponent"
            />
          </label>
          <label>
            <span className="field-label">Data</span>
            <input
              required
              type="date"
              className="field-input"
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              data-testid="input-match-date"
            />
          </label>
          <label>
            <span className="field-label">Campeonato</span>
            <input
              className="field-input"
              value={form.championship}
              onChange={(e) => set("championship", e.target.value)}
              data-testid="input-match-championship"
            />
          </label>
          <label>
            <span className="field-label">Local</span>
            <input
              className="field-input"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              data-testid="input-match-location"
            />
          </label>
          <label>
            <span className="field-label">Resultado</span>
            <select
              className="field-input"
              value={form.result}
              onChange={(e) => set("result", e.target.value)}
              data-testid="select-match-result"
            >
              <option>Vitória</option>
              <option>Derrota</option>
            </select>
          </label>
          <label>
            <span className="field-label">Sets vencidos</span>
            <input
              type="number"
              min="0"
              className="field-input"
              value={form.setsWon}
              onChange={(e) => set("setsWon", e.target.value)}
              data-testid="input-match-sets-won"
            />
          </label>
          <label>
            <span className="field-label">Sets perdidos</span>
            <input
              type="number"
              min="0"
              className="field-input"
              value={form.setsLost}
              onChange={(e) => set("setsLost", e.target.value)}
              data-testid="input-match-sets-lost"
            />
          </label>
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <Button
              variant="secondary"
              onClick={onClose}
              testId="button-cancel-match"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
              testId="button-save-match"
            >
              Salvar partida
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ScoutModal({ match, onClose }: { match: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const athletesQuery = useGetAthletes(undefined, {
    query: { queryKey: getGetAthletesQueryKey() },
  });
  const eventsQuery = useGetScoutEvents(match.id, {
    query: { queryKey: getGetScoutEventsQueryKey(match.id) },
  });
  const create = useCreateScoutEvent();
  const athletes: any[] = athletesQuery.data ?? [];
  const [form, setForm] = useState({
    athleteId: "",
    skill: "ataque",
    zone: "Zona 4",
    result: "ponto",
  });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.athleteId) return;
    create.mutate(
      { matchId: match.id, data: form as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetScoutEventsQueryKey(match.id),
          });
          queryClient.invalidateQueries({ queryKey: getGetMatchesQueryKey() });
          setForm((current) => ({ ...current, result: "ponto" }));
        },
      },
    );
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/50 p-0 sm:items-center sm:p-5">
      <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-6 shadow-[var(--shadow-lg)] sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary/60">
              Scout ao vivo
            </p>
            <h2 className="mt-1 text-xl font-extrabold">
              Praia Norte × {match.opponent}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Cada evento atualiza automaticamente as métricas da partida.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            data-testid="button-close-scout-modal"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">Atleta</span>
            <select
              required
              className="field-input"
              value={form.athleteId}
              onChange={(e) => setForm({ ...form, athleteId: e.target.value })}
              data-testid="select-scout-athlete"
            >
              <option value="">Selecione</option>
              {athletes.map((athlete) => (
                <option key={athlete.id} value={athlete.id}>
                  {athlete.name} · #{athlete.jerseyNumber}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Fundamento</span>
            <select
              className="field-input"
              value={form.skill}
              onChange={(e) => setForm({ ...form, skill: e.target.value })}
              data-testid="select-scout-skill"
            >
              {[
                "ataque",
                "saque",
                "recepção",
                "bloqueio",
                "defesa",
                "levantamento",
              ].map((skill) => (
                <option key={skill}>{skill}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Zona da quadra</span>
            <select
              className="field-input"
              value={form.zone}
              onChange={(e) => setForm({ ...form, zone: e.target.value })}
              data-testid="select-scout-zone"
            >
              {[
                "Zona 1",
                "Zona 2",
                "Zona 3",
                "Zona 4",
                "Zona 5",
                "Zona 6",
                "Fundo",
                "Costura",
              ].map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Resultado</span>
            <select
              className="field-input"
              value={form.result}
              onChange={(e) => setForm({ ...form, result: e.target.value })}
              data-testid="select-scout-result"
            >
              {["ponto", "erro", "bloqueio adversário", "defesa positiva"].map(
                (result) => (
                  <option key={result}>{result}</option>
                ),
              )}
            </select>
          </label>
          <div className="flex justify-end sm:col-span-2">
            <Button
              type="submit"
              disabled={create.isPending || !athletes.length}
              testId="button-save-scout"
            >
              <Zap size={15} />{" "}
              {create.isPending ? "Registrando…" : "Registrar evento"}
            </Button>
          </div>
        </form>
        <div className="mt-7 border-t border-border pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-extrabold">Eventos registrados</p>
            <span className="font-mono text-[10px] text-muted-foreground">
              {eventsQuery.data?.length ?? 0} eventos
            </span>
          </div>
          {eventsQuery.isLoading ? (
            <LoadingBlock rows={3} />
          ) : eventsQuery.isError ? (
            <ErrorBlock onRetry={() => eventsQuery.refetch()} />
          ) : eventsQuery.data?.length ? (
            <div className="divide-y divide-border rounded-xl border border-border">
              {eventsQuery.data.map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 px-3 py-3 text-xs"
                >
                  <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-[10px] uppercase text-primary">
                    {event.skill}
                  </span>
                  <span className="flex-1 font-semibold">
                    {athletes.find((athlete) => athlete.id === event.athleteId)
                      ?.name ?? "Atleta"}
                  </span>
                  <span className="text-muted-foreground">{event.zone}</span>
                  <span
                    className={cn(
                      "font-bold",
                      event.result === "erro"
                        ? "text-destructive"
                        : "text-[hsl(162_45%_30%)]",
                    )}
                  >
                    {event.result}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyBlock
              title="Nenhum evento ainda"
              description="Registre o primeiro fundamento desta partida."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function MatchesWithScout() {
  const [modal, setModal] = useState<{ open: boolean; match?: any }>({
    open: false,
  });
  const [scoutMatch, setScoutMatch] = useState<any>();
  const [period, setPeriod] = useState("season");
  const query = useGetMatches(
    { period: period as any },
    { query: { queryKey: getGetMatchesQueryKey({ period: period as any }) } },
  );
  const matches: any[] = query.data ?? [];
  const completed = matches.filter((match) => match.status === "Concluída");
  const wins = completed.filter((match) => match.result === "Vitória").length;
  const averageAttack = completed.length
    ? completed.reduce((sum, match) => sum + match.attackEfficiency, 0) /
      completed.length
    : 0;
  const averageSideOut = completed.length
    ? completed.reduce((sum, match) => sum + match.sideOut, 0) /
      completed.length
    : 0;
  return (
    <>
      <PageTitle
        eyebrow="Competição · temporada 2024/25"
        title="Partidas"
        description="Registre resultados, compare eficiência e prepare o próximo confronto."
        actions={
          <Button
            onClick={() => setModal({ open: true })}
            testId="button-new-match"
          >
            <Plus size={16} /> Registrar partida
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Campanha"
          value={`${wins}–${completed.length - wins}`}
          detail={`${completed.length} partidas concluídas`}
          icon={Trophy}
          accent="gold"
        />
        <MetricCard
          label="Side-out médio"
          value={averageSideOut.toFixed(1)}
          unit="%"
          detail="partidas concluídas"
          icon={TrendingUp}
          accent="mint"
        />
        <MetricCard
          label="Ataque médio"
          value={averageAttack.toFixed(1)}
          unit="%"
          detail="eficiência ofensiva"
          icon={Zap}
          accent="gold"
        />
      </div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {[
            ["7d", "7 dias"],
            ["30d", "30 dias"],
            ["season", "Temporada"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={cn(
                "rounded-lg px-3 py-2 text-[11px] font-bold",
                period === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
              data-testid={`button-period-${value}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button variant="secondary" testId="button-filter-matches">
          <Filter size={14} /> Filtrar
        </Button>
      </div>
      <SectionCard
        title="Registro de partidas"
        eyebrow={`${matches.length} partidas`}
      >
        {query.isLoading ? (
          <LoadingBlock rows={4} />
        ) : query.isError ? (
          <ErrorBlock onRetry={() => query.refetch()} />
        ) : matches.length === 0 ? (
          <EmptyBlock
            title="Nenhuma partida registrada"
            description="Cadastre a primeira partida da temporada."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[.1em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Partida</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Ataque</th>
                  <th className="px-4 py-3">Side-out</th>
                  <th className="px-4 py-3">Saque</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {matches.map((match) => (
                  <tr
                    key={match.id}
                    className="group hover:bg-muted/30"
                    data-testid={`row-match-${match.id}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-extrabold">
                        Praia Norte{" "}
                        <span className="font-normal text-muted-foreground">
                          ×
                        </span>{" "}
                        {match.opponent}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {match.championship} · {match.location}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px]">
                      {formatDate(match.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold",
                            match.status === "Agendada"
                              ? "bg-muted text-muted-foreground"
                              : match.result === "Vitória"
                                ? "bg-[hsl(162_45%_38%/_.12)] text-[hsl(162_45%_30%)]"
                                : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {match.status === "Agendada"
                            ? "—"
                            : match.result === "Vitória"
                              ? "V"
                              : "D"}
                        </span>
                        <span className="font-mono text-xs">
                          {match.status === "Agendada"
                            ? "A definir"
                            : `${match.setsWon} × ${match.setsLost}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {match.attackEfficiency
                        ? `${match.attackEfficiency}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {match.sideOut ? `${match.sideOut}%` : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {match.serveEfficiency
                        ? `${match.serveEfficiency}%`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        className="p-2"
                        onClick={() => setScoutMatch(match)}
                        testId={`button-scout-match-${match.id}`}
                      >
                        <Activity size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        className="p-2"
                        onClick={() => setModal({ open: true, match })}
                        testId={`button-edit-match-${match.id}`}
                      >
                        <Pencil size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      {modal.open && (
        <MatchModal
          match={modal.match}
          onClose={() => setModal({ open: false })}
        />
      )}
      {scoutMatch && (
        <ScoutModal
          match={scoutMatch}
          onClose={() => setScoutMatch(undefined)}
        />
      )}
    </>
  );
}

function Matches() {
  const [modal, setModal] = useState<{ open: boolean; match?: any }>({
    open: false,
  });
  const [scoutMatch, setScoutMatch] = useState<any>();
  const [period, setPeriod] = useState("season");
  const query = useGetMatches(
    { period: period as any },
    { query: { queryKey: getGetMatchesQueryKey({ period: period as any }) } },
  );
  const matches = query.data ?? [];
  const completed = matches.filter(
    (match: any) => match.status === "Concluída",
  );
  const wins = completed.filter(
    (match: any) => match.result === "Vitória",
  ).length;
  const averageAttack = completed.length
    ? completed.reduce(
        (sum: number, match: any) => sum + match.attackEfficiency,
        0,
      ) / completed.length
    : 0;
  const averageSideOut = completed.length
    ? completed.reduce((sum: number, match: any) => sum + match.sideOut, 0) /
      completed.length
    : 0;
  return (
    <>
      <PageTitle
        eyebrow="Competição · temporada 2024/25"
        title="Partidas"
        description="Registre resultados, compare eficiência e prepare o próximo confronto."
        actions={
          <Button
            onClick={() => setModal({ open: true })}
            testId="button-new-match"
          >
            <Plus size={16} /> Registrar partida
          </Button>
        }
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Campanha"
          value="11–3"
          detail="14 partidas no período"
          icon={Trophy}
          accent="gold"
        />
        <MetricCard
          label="Side-out médio"
          value="63.8"
          unit="%"
          detail="últimas 7 partidas"
          trend={4.1}
          icon={TrendingUp}
          accent="mint"
        />
        <MetricCard
          label="Ataque médio"
          value="48.7"
          unit="%"
          detail="eficiência ofensiva"
          trend={2.8}
          icon={Zap}
        />
      </div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
          {[
            ["7d", "7 dias"],
            ["30d", "30 dias"],
            ["season", "Temporada"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className={cn(
                "rounded-lg px-3 py-2 text-[11px] font-bold",
                period === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
              data-testid={`button-period-${value}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button variant="secondary" testId="button-filter-matches">
          <Filter size={14} /> Filtrar
        </Button>
      </div>
      <SectionCard
        title="Registro de partidas"
        eyebrow={`${matches.length} partidas`}
      >
        {query.isLoading ? (
          <LoadingBlock rows={4} />
        ) : query.isError ? (
          <ErrorBlock onRetry={() => query.refetch()} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-muted/50 text-[10px] uppercase tracking-[.1em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Partida</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Ataque</th>
                  <th className="px-4 py-3">Side-out</th>
                  <th className="px-4 py-3">Saque</th>
                  <th className="px-5 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {matches.map((match: any) => (
                  <tr
                    key={match.id}
                    className="group hover:bg-muted/30"
                    data-testid={`row-match-${match.id}`}
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-extrabold">
                        Praia Norte{" "}
                        <span className="font-normal text-muted-foreground">
                          ×
                        </span>{" "}
                        {match.opponent}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {match.championship} · {match.location}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px]">
                      {formatDate(match.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-7 w-7 items-center justify-center rounded-lg font-mono text-xs font-bold",
                            match.status === "Agendada"
                              ? "bg-muted text-muted-foreground"
                              : match.result === "Vitória"
                                ? "bg-[hsl(162_45%_38%/_.12)] text-[hsl(162_45%_30%)]"
                                : "bg-destructive/10 text-destructive",
                          )}
                        >
                          {match.status === "Agendada"
                            ? "—"
                            : match.result === "Vitória"
                              ? "V"
                              : "D"}
                        </span>
                        <span className="font-mono text-xs">
                          {match.status === "Agendada"
                            ? "A definir"
                            : `${match.setsWon} × ${match.setsLost}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {match.attackEfficiency
                        ? `${match.attackEfficiency}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {match.sideOut ? `${match.sideOut}%` : "—"}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {match.serveEfficiency
                        ? `${match.serveEfficiency}%`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="ghost"
                        className="p-2"
                        onClick={() => setModal({ open: true, match })}
                        testId={`button-edit-match-${match.id}`}
                      >
                        <Pencil size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
      {modal.open && (
        <MatchModal
          match={modal.match}
          onClose={() => setModal({ open: false })}
        />
      )}
    </>
  );
}

function Training() {
  const queryClient = useQueryClient();
  const query = useGetTrainingSessions({
    query: { queryKey: getGetTrainingSessionsQueryKey() },
  });
  const create = useCreateTrainingSession();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    date: "2025-02-26",
    duration: 90,
    perceivedIntensity: 6,
    trainingType: "Técnico + transição",
  });
  const sessions = query.data ?? [];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        data: {
          ...form,
          duration: Number(form.duration),
          perceivedIntensity: Number(form.perceivedIntensity),
        } as any,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: getGetTrainingSessionsQueryKey(),
          });
          setOpen(false);
        },
      },
    );
  };
  return (
    <>
      <PageTitle
        eyebrow="Carga · monitoramento diário"
        title="Treinos"
        description="A carga certa no momento certo. Acompanhe o estímulo, a recuperação e o risco coletivo."
        actions={
          <Button onClick={() => setOpen(true)} testId="button-new-training">
            <Plus size={16} /> Registrar sessão
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Carga da semana"
          value="2.840"
          unit="UA"
          detail="82% da faixa planejada"
          trend={6.2}
          icon={Activity}
          accent="primary"
        />
        <MetricCard
          label="Risco alto"
          value="3"
          detail="atletas para monitorar"
          icon={AlertTriangle}
          accent="rose"
        />
        <MetricCard
          label="Sessões"
          value="5"
          detail="de 6 planejadas"
          icon={Dumbbell}
          accent="gold"
        />
        <MetricCard
          label="Recuperação"
          value="74"
          unit="%"
          detail="prontidão média"
          trend={3.4}
          icon={HeartPulse}
          accent="mint"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard title="Histórico de carga" eyebrow="Últimos 14 dias">
          <div className="flex h-[220px] items-end gap-2 px-5 pb-6 pt-8 sm:gap-3">
            {[38, 52, 44, 71, 58, 86, 64, 48, 74, 66, 92, 78, 58, 70].map(
              (height, i) => (
                <div
                  key={i}
                  className="group flex h-full flex-1 flex-col justify-end gap-2"
                >
                  <div
                    className="relative w-full rounded-t-md bg-primary/80 transition-all group-hover:bg-primary"
                    style={{ height: `${height}%` }}
                  >
                    <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 font-mono text-[9px] group-hover:block">
                      {Math.round(height * 10.2)}
                    </span>
                  </div>
                  <span className="text-center font-mono text-[9px] text-muted-foreground">
                    {i % 2 === 0 ? `D${i + 1}` : ""}
                  </span>
                </div>
              ),
            )}
          </div>
        </SectionCard>
        <SectionCard title="Radar de prontidão" eyebrow="Status do elenco">
          <div className="px-5 py-6">
            <div
              className="relative mx-auto flex h-[178px] w-[178px] items-center justify-center rounded-full border border-primary/15"
              style={{
                background:
                  "conic-gradient(hsl(var(--primary)) 0 74%, hsl(var(--muted)) 74% 100%)",
              }}
            >
              <div className="flex h-[140px] w-[140px] flex-col items-center justify-center rounded-full bg-card">
                <span className="text-3xl font-extrabold tracking-[-.08em]">
                  74
                </span>
                <span className="font-mono text-[9px] uppercase text-muted-foreground">
                  prontidão
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-5 text-[10px]">
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-primary" /> disponível{" "}
                <b>12</b>
              </span>
              <span className="flex items-center gap-1.5">
                <i className="h-2 w-2 rounded-full bg-muted" /> atenção <b>6</b>
              </span>
            </div>
          </div>
        </SectionCard>
      </div>
      <div className="mt-5">
        <SectionCard
          title="Sessões registradas"
          eyebrow={`${sessions.length} sessões recentes`}
        >
          <div className="divide-y divide-border/70">
            {query.isLoading ? (
              <LoadingBlock rows={4} />
            ) : query.isError ? (
              <ErrorBlock onRetry={() => query.refetch()} />
            ) : (
              sessions.map((session: any) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  data-testid={`row-training-${session.id}`}
                >
                  <div className="flex w-20 shrink-0 items-center gap-2">
                    <CalendarDays size={14} className="text-primary" />
                    <span className="font-mono text-[11px]">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold">{session.trainingType}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {session.duration} minutos · RPE{" "}
                      {session.perceivedIntensity}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold">
                    {session.load}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      UA
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold",
                      session.fatigueRisk === "Alto"
                        ? "bg-destructive/10 text-destructive"
                        : session.fatigueRisk === "Moderado"
                          ? "bg-accent/20 text-accent-foreground"
                          : "bg-[hsl(162_45%_38%/_.11)] text-[hsl(162_45%_30%)]",
                    )}
                  >
                    {session.fatigueRisk} risco
                  </span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/50 p-0 sm:items-center sm:p-5">
          <div className="w-full max-w-lg rounded-t-3xl bg-card p-6 sm:rounded-3xl">
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary/60">
                  Carga interna
                </p>
                <h2 className="mt-1 text-xl font-extrabold">
                  Registrar sessão
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                data-testid="button-close-training-modal"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="field-label">Data</span>
                <input
                  type="date"
                  className="field-input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  data-testid="input-training-date"
                />
              </label>
              <label>
                <span className="field-label">Duração (min)</span>
                <input
                  type="number"
                  className="field-input"
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: Number(e.target.value) })
                  }
                  data-testid="input-training-duration"
                />
              </label>
              <label>
                <span className="field-label">Intensidade percebida</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="field-input"
                  value={form.perceivedIntensity}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      perceivedIntensity: Number(e.target.value),
                    })
                  }
                  data-testid="input-training-intensity"
                />
              </label>
              <label>
                <span className="field-label">Tipo de sessão</span>
                <select
                  className="field-input"
                  value={form.trainingType}
                  onChange={(e) =>
                    setForm({ ...form, trainingType: e.target.value })
                  }
                  data-testid="select-training-type"
                >
                  <option>Técnico + transição</option>
                  <option>Força — membros inferiores</option>
                  <option>Sistemas de jogo</option>
                  <option>Recuperação ativa</option>
                </select>
              </label>
              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <Button
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  testId="button-cancel-training"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending}
                  testId="button-save-training"
                >
                  Salvar sessão
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Court({ zones, title }: { zones: any[]; title: string }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold">{title}</p>
        <span className="font-mono text-[9px] uppercase text-muted-foreground">
          eficiência
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {zones.map((zone: any) => (
          <div
            key={zone.zone}
            className="relative flex h-24 flex-col justify-end overflow-hidden rounded-xl border border-border bg-muted/40 p-2.5"
            data-testid={`zone-${title}-${zone.zone}`}
          >
            <div
              className="absolute inset-x-0 bottom-0 bg-primary/10"
              style={{ height: `${Math.max(zone.efficiency * 2, 8)}%` }}
            />
            <span className="relative font-mono text-[9px] text-muted-foreground">
              {zone.zone}
            </span>
            <strong className="relative mt-1 text-xl font-extrabold tracking-[-.06em]">
              {zone.efficiency}
              <span className="text-[10px] font-semibold">%</span>
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analysis() {
  const athletesQuery = useGetAthletes(undefined, {
    query: { queryKey: getGetAthletesQueryKey() },
  });
  const athletes: any[] = athletesQuery.data ?? [];
  const [first, setFirst] = useState(athletes[0]?.id ?? "");
  const [second, setSecond] = useState(athletes[1]?.id ?? "");
  const params = useMemo(
    () => ({ firstAthleteId: first, secondAthleteId: second }),
    [first, second],
  );
  const tactical = useGetTacticalSummary({
    query: { queryKey: getGetTacticalSummaryQueryKey() },
  });
  const comparison = useGetAthleteComparison(params, {
    query: {
      enabled: !!first && !!second,
      queryKey: getGetAthleteComparisonQueryKey(params),
    },
  });
  const tacticalData: any = tactical.data;
  const pair: any = comparison.data;
  if (athletesQuery.isLoading || tactical.isLoading)
    return <LoadingBlock rows={5} />;
  if (athletesQuery.isError)
    return (
      <ErrorBlock
        onRetry={() => {
          athletesQuery.refetch();
          tactical.refetch();
        }}
      />
    );
  if (!athletes.length || !tacticalData)
    return (
      <EmptyBlock
        title="Dados insuficientes para análise"
        description="Registre atletas e eventos de scout para habilitar esta leitura."
      />
    );
  if (comparison.isLoading || !pair) return <LoadingBlock rows={4} />;
  const compareMetrics = [
    "attack",
    "serve",
    "block",
    "reception",
    "defense",
    "setting",
  ];
  const labels: Record<string, string> = {
    attack: "Ataque",
    serve: "Saque",
    block: "Bloqueio",
    reception: "Recepção",
    defense: "Defesa",
    setting: "Levantamento",
  };
  return (
    <>
      <PageTitle
        eyebrow="Leitura de jogo · inteligência tática"
        title="Análise"
        description="Transforme cada rally em uma decisão melhor para a próxima rotação."
        actions={
          <Button variant="secondary" testId="button-analysis-filter">
            <Filter size={15} /> Partidas analisadas <ChevronRight size={14} />
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <SectionCard
          title="Mapa de ataque"
          eyebrow="Distribuição por zona · temporada"
        >
          <div className="p-5">
            {tactical.isLoading ? (
              <LoadingBlock rows={2} />
            ) : tactical.isError ? (
              <ErrorBlock onRetry={() => tactical.refetch()} />
            ) : (
              <Court zones={tacticalData.attackZones} title="Ataque" />
            )}
          </div>
        </SectionCard>
        <SectionCard title="Mapa de saque" eyebrow="Pressão criada por zona">
          <div className="p-5">
            <Court zones={tacticalData.serveZones} title="Saque" />
          </div>
        </SectionCard>
      </div>
      <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/10 p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-accent p-2 text-accent-foreground">
            <Sparkles size={16} />
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[.14em] text-accent-foreground/70">
              Insight recomendado
            </p>
            <p className="mt-1 max-w-3xl text-sm font-bold leading-6 text-accent-foreground">
              {tacticalData.insight}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <SectionCard
          title="Comparar atletas"
          eyebrow="Leitura lado a lado"
          action={
            <div className="flex gap-2">
              <select
                className="field-input h-8 py-1 text-[11px]"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
                data-testid="select-comparison-first"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <select
                className="field-input h-8 py-1 text-[11px]"
                value={second}
                onChange={(e) => setSecond(e.target.value)}
                data-testid="select-comparison-second"
              >
                {athletes.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {[pair.first, pair.second].map((athlete: any, index: number) => (
              <div
                key={athlete?.id ?? index}
                className="rounded-xl border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center gap-3">
                  <AthleteAvatar athlete={athlete} />
                  <div>
                    <p className="text-xs font-extrabold">{athlete?.name}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {athlete?.position}
                    </p>
                  </div>
                  <span className="ml-auto font-mono text-xl font-extrabold text-primary">
                    {athlete?.performance?.toFixed(1)}
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {compareMetrics.map((metric) => (
                    <div key={metric}>
                      <div className="mb-1 flex justify-between text-[10px]">
                        <span className="font-semibold">{labels[metric]}</span>
                        <span className="font-mono">
                          {athlete?.metrics?.[metric] ?? 0}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            index === 0 ? "bg-primary" : "bg-accent",
                          )}
                          style={{
                            width: `${athlete?.metrics?.[metric] ?? 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function Reports() {
  const queryClient = useQueryClient();
  const query = useGetReports({ query: { queryKey: getGetReportsQueryKey() } });
  const create = useCreateReport();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Equipe",
    subject: "Adulto feminino",
  });
  const reports: any[] = query.data ?? [];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      { data: form as any },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetReportsQueryKey() });
          setOpen(false);
          setForm({ title: "", type: "Equipe", subject: "Adulto feminino" });
        },
      },
    );
  };
  return (
    <>
      <PageTitle
        eyebrow="Inteligência · documentos"
        title="Relatórios"
        description="Relatórios claros para decisões que precisam sair do papel."
        actions={
          <Button onClick={() => setOpen(true)} testId="button-new-report">
            <Plus size={16} /> Gerar relatório
          </Button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Relatórios gerados"
          value={reports.length}
          detail="nesta temporada"
          icon={FileBarChart}
          accent="primary"
        />
        <MetricCard
          label="Último relatório"
          value={reports[0] ? formatDate(reports[0].createdAt) : "—"}
          detail="pronto para compartilhar"
          icon={Clock3}
          accent="gold"
        />
        <MetricCard
          label="Cobertura"
          value={reports.length ? "100" : "0"}
          unit="%"
          detail="registros disponíveis"
          trend={reports.length ? 8.2 : undefined}
          icon={ShieldCheck}
          accent="mint"
        />
      </div>
      <div className="mt-5">
        <SectionCard
          title="Biblioteca de relatórios"
          eyebrow={`${reports.length} documentos`}
          action={
            <Button
              variant="secondary"
              className="py-2"
              testId="button-filter-reports"
            >
              <Filter size={14} /> Filtrar
            </Button>
          }
        >
          {query.isLoading ? (
            <LoadingBlock rows={4} />
          ) : query.isError ? (
            <ErrorBlock onRetry={() => query.refetch()} />
          ) : reports.length === 0 ? (
            <EmptyBlock
              title="Nenhum relatório gerado"
              description="Crie o primeiro relatório persistido do workspace."
            />
          ) : (
            <div className="divide-y divide-border/70">
              {reports.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </div>
          )}
        </SectionCard>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-sidebar/50 p-0 sm:items-center sm:p-5">
          <div className="w-full max-w-lg rounded-t-3xl bg-card p-6 sm:rounded-3xl">
            <div className="flex justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.15em] text-primary/60">
                  Novo documento
                </p>
                <h2 className="mt-1 text-xl font-extrabold">Gerar relatório</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                data-testid="button-close-report-modal"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submit} className="mt-6 space-y-4">
              <label>
                <span className="field-label">Título do relatório</span>
                <input
                  required
                  className="field-input"
                  placeholder="Ex.: Análise de performance — rodada 14"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  data-testid="input-report-title"
                />
              </label>
              <label>
                <span className="field-label">Tipo</span>
                <select
                  className="field-input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  data-testid="select-report-type"
                >
                  <option>Equipe</option>
                  <option>Individual</option>
                </select>
              </label>
              <label>
                <span className="field-label">Referência</span>
                <input
                  required
                  className="field-input"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  data-testid="input-report-subject"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={() => setOpen(false)}
                  testId="button-cancel-report"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending}
                  testId="button-save-report"
                >
                  {create.isPending ? "Gerando…" : "Gerar relatório"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
function ReportRow({ report }: { report: any }) {
  return (
    <div
      className="flex items-center gap-3 px-5 py-4"
      data-testid={`row-report-${report.id}`}
    >
      <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
        <FileBarChart size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-extrabold">{report.title}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          {report.type} · {report.subject} · {formatDate(report.createdAt)}
        </p>
      </div>
      <span
        className={cn(
          "hidden rounded-full px-2.5 py-1 text-[10px] font-bold sm:inline-flex",
          report.status === "Pronto"
            ? "bg-[hsl(162_45%_38%/_.11)] text-[hsl(162_45%_30%)]"
            : "bg-accent/20 text-accent-foreground",
        )}
      >
        {report.status}
      </span>
      <Button
        variant="ghost"
        className="p-2"
        testId={`button-open-report-${report.id}`}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}

function Settings() {
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("Clube");
  const [form, setForm] = useState({
    club: "Praia Norte Vôlei",
    team: "Adulto feminino",
    season: "2024/25",
    coach: "Mariana Albuquerque",
    email: "mariana@praianortevolei.com",
  });
  const save = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2800);
  };
  return (
    <>
      <PageTitle
        eyebrow="Workspace · administração"
        title="Configurações"
        description="Ajuste o contexto que orienta os dados de toda a equipe."
      />
      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-2 lg:block lg:h-fit lg:space-y-1">
          {["Clube", "Equipe", "Perfil e acesso"].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn(
                "w-full whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors",
                tab === item
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
              data-testid={`button-settings-${item.toLowerCase().replaceAll(" ", "-")}`}
            >
              {item}
            </button>
          ))}
        </div>
        <SectionCard
          title={`${tab} e preferências`}
          eyebrow="Configuração ativa"
        >
          <form onSubmit={save} className="max-w-2xl p-5 sm:p-7">
            {tab === "Perfil e acesso" ? (
              <div className="space-y-5">
                <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-mono text-sm text-primary-foreground">
                    DM
                  </div>
                  <div>
                    <p className="text-sm font-extrabold">Diego Martins</p>
                    <p className="text-xs text-muted-foreground">
                      Performance analyst · acesso administrador
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="ml-auto"
                    testId="button-manage-access"
                  >
                    Gerenciar
                  </Button>
                </div>
                <label>
                  <span className="field-label">E-mail de notificações</span>
                  <input
                    className="field-input"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    data-testid="input-settings-email"
                  />
                </label>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="field-label">
                    {tab === "Clube" ? "Nome do clube" : "Nome da equipe"}
                  </span>
                  <input
                    className="field-input"
                    value={tab === "Clube" ? form.club : form.team}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [tab === "Clube" ? "club" : "team"]: e.target.value,
                      })
                    }
                    data-testid="input-settings-name"
                  />
                </label>
                <label>
                  <span className="field-label">Temporada</span>
                  <select
                    className="field-input"
                    value={form.season}
                    onChange={(e) =>
                      setForm({ ...form, season: e.target.value })
                    }
                    data-testid="select-settings-season"
                  >
                    <option>2024/25</option>
                    <option>2025/26</option>
                  </select>
                </label>
                <label>
                  <span className="field-label">Comissão técnica</span>
                  <input
                    className="field-input"
                    value={form.coach}
                    onChange={(e) =>
                      setForm({ ...form, coach: e.target.value })
                    }
                    data-testid="input-settings-coach"
                  />
                </label>
              </div>
            )}
            <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
              <Button type="submit" testId="button-save-settings">
                Salvar alterações
              </Button>
              {saved && (
                <span
                  className="flex items-center gap-1.5 text-xs font-bold text-[hsl(162_45%_30%)]"
                  data-testid="status-settings-saved"
                >
                  <Check size={14} /> Alterações salvas
                </span>
              )}
            </div>
          </form>
        </SectionCard>
      </div>
    </>
  );
}

function AuthLanding() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-sidebar px-5 py-10 text-sidebar-foreground">
      <div className="w-full max-w-xl rounded-3xl border border-sidebar-border bg-sidebar-accent/60 p-8 shadow-[var(--shadow-lg)] sm:p-12">
        <div className="flex items-center gap-3">
          <IconMark />
          <div>
            <p className="text-lg font-extrabold">
              Vôlei <span className="text-sidebar-primary">Pro</span>
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[.2em] text-sidebar-foreground/50">
              Performance intelligence
            </p>
          </div>
        </div>
        <p className="mt-12 font-mono text-[10px] uppercase tracking-[.2em] text-sidebar-primary">
          Workspace de performance
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-[-.05em] sm:text-5xl">
          Decisões melhores para cada rally.
        </h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-sidebar-foreground/65">
          Centralize dados técnicos, carga física e leitura tática do seu clube
          em um único ambiente seguro.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center rounded-xl bg-sidebar-primary px-4 py-3 text-xs font-bold text-sidebar-primary-foreground"
            data-testid="link-sign-in"
          >
            Entrar no workspace
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl border border-sidebar-border px-4 py-3 text-xs font-bold text-sidebar-foreground hover:bg-sidebar-accent"
            data-testid="link-sign-up"
          >
            Criar acesso
          </Link>
        </div>
      </div>
    </div>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const previousUser = useRef<string | null | undefined>(undefined);
  useEffect(
    () =>
      addListener(({ user }) => {
        const nextUser = user?.id ?? null;
        if (
          previousUser.current !== undefined &&
          previousUser.current !== nextUser
        )
          queryClient.clear();
        previousUser.current = nextUser;
      }),
    [addListener],
  );
  return null;
}

function ProtectedRouter() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingBlock rows={6} />;
  if (!isSignedIn) return <Redirect to="/" />;
  return (
    <Shell>
      <ErrorBoundary resetKey={window.location.pathname}>
        <Switch>
          <Route path="/athletes" component={Athletes} />
          <Route path="/athletes/:id" component={AthleteProfile} />
          <Route path="/matches" component={MatchesWithScout} />
          <Route path="/training" component={Training} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/reports" component={Reports} />
          <Route path="/settings" component={Settings} />
          <Route
            component={() => (
              <EmptyBlock
                title="Página não encontrada"
                description="A rota que você acessou não existe neste workspace."
                action={
                  <Link
                    href="/"
                    className="inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground"
                    data-testid="link-back-dashboard"
                  >
                    Voltar ao dashboard
                  </Link>
                }
              />
            )}
          />
        </Switch>
      </ErrorBoundary>
    </Shell>
  );
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingBlock rows={6} />;
  return isSignedIn ? (
    <Shell>
      <Dashboard />
    </Shell>
  ) : (
    <AuthLanding />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={ProtectedRouter} />
    </Switch>
  );
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#075985",
    colorForeground: "#102A43",
    colorMutedForeground: "#627D98",
    colorDanger: "#B42318",
    colorBackground: "#FFFFFF",
    colorInput: "#F5F7FA",
    colorInputForeground: "#102A43",
    colorNeutral: "#D9E2EC",
    fontFamily: "Manrope, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-slate-900",
    headerSubtitle: "text-slate-600",
    socialButtonsBlockButtonText: "text-slate-800",
    formFieldLabel: "text-slate-800",
    footerActionLink: "text-sky-800",
    footerActionText: "text-slate-600",
    dividerText: "text-slate-500",
    formButtonPrimary: "bg-sky-800 hover:bg-sky-900",
    formFieldInput: "bg-slate-50 text-slate-900 border-slate-200",
    socialButtonsBlockButton: "border-slate-200 bg-white",
    logoBox: "mb-2",
    logoImage: "max-h-10",
    dividerLine: "bg-slate-200",
    alert: "bg-red-50 text-red-800",
    alertText: "text-red-800",
    main: "bg-transparent",
  },
};

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Router />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
