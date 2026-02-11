import type {Route} from './+types/_index';

export function meta({}: Route.MetaArgs) {
  return [{title: 'Hy-lee | Home'}];
}

export default function Homepage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-20">
      <h1 className="text-5xl text-dark mb-8">Hy-lee</h1>
      <p className="text-text-muted text-lg mb-8">
        Hydrogen migration — Phase 1: Foundation complete.
      </p>

      {/* Color tokens */}
      <section className="mb-12">
        <h2 className="text-2xl text-dark mb-4">Colors</h2>
        <div className="flex flex-wrap gap-4">
          <Swatch className="bg-primary" label="Primary" />
          <Swatch className="bg-secondary" label="Secondary" />
          <Swatch className="bg-accent" label="Accent" />
          <Swatch className="bg-dark" label="Dark" />
          <Swatch className="bg-warning" label="Warning" />
          <Swatch className="bg-surface" label="Surface" />
          <Swatch className="bg-border" label="Border" />
        </div>
      </section>

      {/* Typography tokens */}
      <section className="mb-12">
        <h2 className="text-2xl text-dark mb-4">Typography</h2>
        <div className="space-y-2">
          <p className="text-xs text-text">text-xs (0.75rem)</p>
          <p className="text-sm text-text">text-sm (0.875rem)</p>
          <p className="text-base text-text">text-base (1rem)</p>
          <p className="text-lg text-text">text-lg (1.125rem)</p>
          <p className="text-xl text-text">text-xl (1.25rem)</p>
          <p className="text-2xl text-text">text-2xl (1.5rem)</p>
          <p className="text-3xl text-text">text-3xl (1.875rem)</p>
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-text">Default text color</p>
          <p className="text-text-muted">Muted text color</p>
          <p className="text-text-light">Light text color</p>
        </div>
      </section>

      {/* Radius & Shadow tokens */}
      <section className="mb-12">
        <h2 className="text-2xl text-dark mb-4">Radius &amp; Shadows</h2>
        <div className="flex flex-wrap gap-6">
          <div className="h-24 w-24 bg-surface border border-border rounded-sm shadow-sm flex items-center justify-center text-xs text-text-muted">
            sm
          </div>
          <div className="h-24 w-24 bg-surface border border-border rounded shadow flex items-center justify-center text-xs text-text-muted">
            default
          </div>
          <div className="h-24 w-24 bg-surface border border-border rounded-lg shadow-md flex items-center justify-center text-xs text-text-muted">
            lg / md
          </div>
          <div className="h-24 w-24 bg-surface border border-border rounded-xl shadow-lg flex items-center justify-center text-xs text-text-muted">
            xl / lg
          </div>
          <div className="h-24 w-24 bg-surface border border-border rounded-2xl shadow-xl flex items-center justify-center text-xs text-text-muted">
            2xl / xl
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section className="mb-12">
        <h2 className="text-2xl text-dark mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary text-white px-6 py-3 rounded font-semibold shadow-md hover:shadow-lg">
            Primary
          </button>
          <button className="bg-secondary text-white px-6 py-3 rounded font-semibold shadow-md hover:shadow-lg">
            Secondary
          </button>
          <button className="bg-accent text-dark px-6 py-3 rounded font-semibold shadow-md hover:shadow-lg">
            Accent
          </button>
          <button className="bg-dark text-white px-6 py-3 rounded font-semibold shadow-md hover:shadow-lg">
            Dark
          </button>
        </div>
      </section>

      {/* Spacing */}
      <section>
        <h2 className="text-2xl text-dark mb-4">Spacing Scale</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map((n) => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-12 text-sm text-text-muted text-right">
                {n}
              </span>
              <div
                className="h-4 bg-primary rounded-sm"
                style={{width: `${n * 16}px`}}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Swatch({className, label}: {className: string; label: string}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`h-16 w-16 rounded-lg border border-border ${className}`}
      />
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}
