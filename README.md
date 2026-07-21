<div align="center">

<img src="images/saraswati-tint.png" alt="Sarasvatī with a vīnā" width="160">

# Data Darśana

### An intelligent way of seeing data

<br>

**[ Open the map → ](https://ai-first-community.github.io/data-darsana)**

<br>

*[Why Sarasvatī](https://ai-first-community.github.io/data-darsana/philosophy.html)
· [Cheatsheet PDF](https://ai-first-community.github.io/data-darsana/cheatsheets/data-darsana-cheatsheet.pdf)*

</div>

<br>

---

<br>

> No one designs a data estate. It accumulates.
>
> A warehouse from one era, a lake from the next, a mesh someone announced and half-built,
> and now a scramble of vector indexes and agents bolted to the side. Every layer was a
> reasonable decision at the time. Together they are a landscape nobody can hold in their
> head — and you are asked to draw a target architecture for it by Thursday.

**Data Darśana is a map for that moment.**

Not a maturity model that scores you, and not a reference architecture that assumes you
are starting from nothing. A map: the whole territory laid out at once, so you can find
where you actually stand, see what genuinely connects to what, and make the next decision
with your eyes open.

<br>

<div align="center">

| **248** | **6** | **20** | **128** | **13** | **1,888** | **112** |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| capabilities | pillars | domains | archetypes | families | links | diagrams |

</div>

<br>

## The gap it closes

Most capability models tell you **what you must be able to do**. Reference architectures
tell you **what good looks like** in one shape. Almost nothing connects the two — and that
gap is precisely where architecture lives, where the arguments happen, and where budgets
are won or lost.

Data Darśana holds both halves and joins them:

- **Capabilities** — *what must we be able to do?*
  248 capabilities across 20 domains and 6 pillars, each placed in the stage of maturity
  where it first genuinely matters.

- **Archetypes** — *how do we actually assemble it?*
  128 architecture patterns in 13 families. Each one carries when to use it, how data
  flows through it, its governance model, its honest limitations, and where it typically
  evolves next.

- **The matrix** — 1,888 graded links.
  Choose a pattern and read off the capabilities it demands as **Core** or **Supporting**.
  Choose a capability and see which patterns depend on it. That join is what most models
  leave to the reader.

## What it believes

**The past is often still the right answer.** Kimball and Inmon sit in this map beside the
lakehouse and the semantic layer — not as history, but as live options. Batch ETL remains
correct for a great deal of regulated reporting. A map that treats everything older than
five years as a mistake will fail you in exactly the estates that matter most.

**Honesty is more useful than enthusiasm.** Every pattern here states what it costs. Data
mesh is described as most programmes actually experienced it. "Self-healing pipelines"
are not oversold. Where a technique is genuinely unproven, it says so — because the
fastest way to lose a room of senior architects is to tell them something they know is
untrue.

**A diagram should argue, not decorate.** Each drawing is made to show what the definition
cannot say: where the control point sits, which arrow is the expensive one, what the shape
quietly costs you. Sixteen archetypes have no diagram at all, deliberately — a picture
that merely restates its definition is padding, and padding is the tell of a deck with
nothing to say.

**Machines are readers too.** The same taxonomy is published as structured knowledge, not
just pixels — because the systems being designed here will increasingly need to read the
map as well as the people designing them.

## Seven ways of seeing

One taxonomy, seven vantages. Change the view and no fact changes — only your position.

| | View | What it answers |
|---|---|---|
| ◉ | **Graph** | how everything relates, clustered by domain and family |
| ✧ | **Constellation** | how capabilities and archetypes actually connect |
| ✳ | **Sunburst** | the hierarchy, opening outward from one centre |
| ↗ | **Roadmap** | the four stages — what enters when, and why then |
| ▦ | **Heatmap** | where effort concentrates across pillars and stages |
| ◈ | **Radar** | *where do we stand?* — score yourself against the model |
| ▤ | **Tables** | the atlases, the coverage matrix, and Architecture Eras |

### Architecture Eras

The same 128 archetypes, sorted by the **work they serve** and the **generation they
belong to** — proven, mainstream, frontier, side by side.

Read a row across and you are often reading how a kind of work evolved. Conformed
dimensions become the semantic layer, which becomes the contract an agent queries. The
ESB's service registry becomes the API gateway, which becomes the tool gateway an agent
calls. Nothing was replaced so much as renamed and re-let.

Empty cells are left visible on purpose. They mark where the map is genuinely thin — and
where an era simply has not happened yet.

## The diagrams

> *"The table format war has largely resolved. The contested layer is the catalog above
> it, because that is what owns access control, lineage and the commit protocol."*

> *"Cheap for the first three integrations and quietly fatal by the thirtieth: five
> endpoints is ten interfaces; thirty is four hundred and thirty-five."*

> *"Only one node exits the loop. Everything else re-plans — so it needs a hard iteration
> cap, which is a product decision, not a tuning knob."*

That is the register throughout: what it is, and what it will cost you.

## Where to start

- **New to it** — open the map and go to **▤ Tables → Architecture Eras**. It is the
  fastest way to see the whole landscape and locate what you already run.
- **Assessing an estate** — use **◈ Radar** to score yourself per pillar against the
  model's targets. The gap it draws is your roadmap.
- **Planning a build** — find your pattern in the **Archetype Atlas**, then read its Core
  capabilities. That is your minimum viable scope, before anyone negotiates it down.
- **Preparing a board paper** — the [cheatsheet PDF](https://ai-first-community.github.io/data-darsana/cheatsheets/data-darsana-cheatsheet.pdf)
  is the whole model as a printable field guide, including the full era grid.

## On the name

**Darśana** (दर्शन) means *seeing* — and in Indian philosophy, an entire way of seeing; a
school of thought, a stance from which the world becomes legible.

The emblem is **Sarasvatī**, goddess of knowledge, music and flow — offered as homage, not
doctrine. She is *Vīṇā-vādinī*, she who plays the seven *svaras*. Seven notes are not seven
songs; they are one music heard from seven positions. That is the whole idea behind the
seven views, and the [philosophy page](https://ai-first-community.github.io/data-darsana/philosophy.html)
tells it properly.

Data Darśana is a sibling to **Bodhi Map — Awakening to AI**.

<br>

---

<div align="center">

**Created by [Sanjeev Azad](https://www.linkedin.com/in/sanjeevazad/)**

*If it helps you see your own estate more clearly, it has done its job.*

<br>

<sub>This repository holds the published site. The capability model, build pipeline and
diagram sources live in a private repository and are published from there.<br>
Licensed under the terms in [LICENSE](LICENSE).</sub>

</div>
