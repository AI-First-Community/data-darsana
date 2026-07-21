<div align="center">

<img src="images/saraswati-tint.png" alt="Sarasvatī with a vīnā" width="150">

# Data Darśana

**An intelligent way of seeing data**

A living map of the data architecture behind analytics, generative AI and agents.

### → **[Open the map](https://ai-first-community.github.io/data-darsana)** ←

[Why Sarasvatī](https://ai-first-community.github.io/data-darsana/philosophy.html) ·
[Cheatsheet PDF](https://ai-first-community.github.io/data-darsana/cheatsheets/data-darsana-cheatsheet.pdf)

<br>

| 248 | 6 | 20 | 128 | 13 | 1,888 | 112 |
|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| capabilities | pillars | domains | archetypes | families | links | diagrams |

</div>

---

## The problem it solves

Most capability models tell you **what you must be able to do**. Almost none tell you
**how to assemble it** — and the gap between those two is where architecture actually
lives. Data Darśana holds both, and connects them:

- **Capabilities** — *what must we be able to do?* 248 capabilities across 20 domains,
  grouped into 6 pillars, each placed in the stage of maturity where it first matters.
- **Archetypes** — *how do we assemble it?* 128 architecture patterns in 13 families,
  each with when to use it, how data flows, its governance model, its honest limitations,
  and where it typically evolves next.
- **The matrix** — 1,888 links grading which capabilities each archetype needs as **Core**
  (mandatory) or **Supporting**. Pick a pattern and you can read off the capabilities it
  demands; pick a capability and you can see which patterns it unlocks.

## Seven ways to look at it

One taxonomy, seven vantages — change the view and no fact changes, only your position.

| | View | What it answers |
|---|---|---|
| ◉ | **Graph** | how everything relates, clustered by domain and family |
| ✧ | **Constellation** | how capabilities and archetypes actually connect |
| ✳ | **Sunburst** | the hierarchy, from one centre outward |
| ↗ | **Roadmap** | the four stages — what enters when |
| ▦ | **Heatmap** | where effort concentrates across pillars and stages |
| ◈ | **Radar** | *where do we stand?* — an interactive readiness scan against the model |
| ▤ | **Tables** | the atlases, the coverage matrix, and Architecture Eras |

### Architecture Eras

The same 128 archetypes, sorted by the **work they serve** (transactional, integration,
real-time, analytics, reporting, master data, platform, governance, AI & agentic) and the
**generation they belong to**:

**Proven** — long-settled patterns that remain the right answer for governed, well-understood work.
**Mainstream** — the current default: widely deployed, well-tooled, low argument.
**Frontier** — actively forming; high leverage, thinner track record, faster change.

Read a row across and you often see how that kind of work evolved — Inmon and Kimball
sitting in the same row as the lakehouse and the semantic layer; the ESB service registry
in the same lineage as the API gateway and today's agent tool gateway. Empty cells are
left visible on purpose: they mark where the map is genuinely thin, and where an era
simply has not happened yet.

## 112 diagrams

Most archetypes carry a diagram, and each one is drawn to show **what the definition
cannot say** — where the control point sits, which arrow is the expensive one, what the
picture costs you. Captions carry the trade-off rather than the sales pitch:

> *"The table format war has largely resolved. The contested layer is the catalog above
> it, because that is what owns access control, lineage and the commit protocol."*

> *"Cheap for the first three integrations and quietly fatal by the thirtieth: five
> endpoints is ten interfaces; thirty is four hundred and thirty-five."*

Sixteen archetypes have no diagram, deliberately. A picture that only restates the
definition is padding, and padding is worse than a gap.

## Where to start

- **New here?** Open the map and press **▤ Tables → Architecture Eras**. It is the
  fastest way to see the whole landscape and locate what you already run.
- **Assessing your estate?** Use **◈ Radar** to score yourself per pillar against the
  model's targets. The gap is your roadmap.
- **Planning a build?** Find your pattern in the **Archetype Atlas**, then read its Core
  capabilities — that is your minimum viable scope.
- **Want it on paper?** The [cheatsheet PDF](https://ai-first-community.github.io/data-darsana/cheatsheets/data-darsana-cheatsheet.pdf)
  is the whole model as a printable field guide, including the full era grid.

## The name

**Darśana** (दर्शन) means *seeing* — and in Indian philosophy, a whole way of seeing. The
emblem is **Sarasvatī**, goddess of knowledge, music and flow, offered as homage rather
than doctrine. The [philosophy page](https://ai-first-community.github.io/data-darsana/philosophy.html)
explains why seven views, and why a data model borrowed a metaphor from music.

Data Darśana is a sibling to **Bodhi Map — Awakening to AI**.

---

<div align="center">

Created by **Sanjeev Azad** · [LinkedIn](https://www.linkedin.com/in/sanjeevazad/)

This repository holds the published site. The capability model, build pipeline and
diagram sources live in a private repository and are published from there.

Licensed under the terms in [LICENSE](LICENSE).

</div>
