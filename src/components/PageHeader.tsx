import type { ReactNode } from 'react'

/** Title band at the top of inner pages. */
export function PageHeader({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-white">
      <div className="container-x py-10 lg:py-14">
        <h1 className="max-w-3xl text-3xl/tight font-bold sm:text-4xl/tight">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg/relaxed text-muted">{lead}</p>}
        {children}
      </div>
    </div>
  )
}

/** Marks a page whose full layout is built in Phase 2. Remove with the placeholders. */
export function Phase2Note({ what }: { what: string }) {
  return (
    <div className="container-x py-10" lang="en" dir="ltr">
      <p className="rounded-card border-2 border-dashed border-line bg-white p-5 text-sm text-muted">
        <strong className="text-navy">Phase 1 placeholder.</strong> Routing, data, SEO tags and contact links on this
        page are live; the full design ({what}) is built in Phase 2.
      </p>
    </div>
  )
}
