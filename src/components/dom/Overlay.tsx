import { Fragment } from 'react'
import { slides, type Block } from '../../content/slides.fr'
import { useShow } from '../../store'
import { Score } from './Score'
import { Timer } from './Timer'

function renderCode(line: string, key: number) {
  // met en valeur les mots-clés de la User Story comme dans l'original
  const keywords = ['En tant que', 'Je veux', 'Afin de']
  const kw = keywords.find((k) => line.startsWith(k))
  if (!kw) return <div key={key}>{line}</div>
  return (
    <div key={key}>
      <span className="kw">{kw}</span>
      {line.slice(kw.length)}
    </div>
  )
}

function BlockView({ block, slideIndex }: { block: Block; slideIndex: number }) {
  switch (block.kind) {
    case 'paragraph':
      return <p className={block.strong ? 'strong' : ''}>{block.text}</p>
    case 'list':
      return (
        <ul className={`block-list ${block.columns === 2 ? 'two-cols' : ''}`}>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )
    case 'cards':
      return (
        <div className="block-cards">
          {block.items.map((card, i) => (
            <div className="card" key={i} style={card.color ? { borderColor: card.color, background: `${card.color}14` } : undefined}>
              <h3 style={card.color ? { color: card.color } : undefined}>
                <span className="icon">{card.icon}</span>
                {card.title}
              </h3>
              <p>{card.text}</p>
            </div>
          ))}
        </div>
      )
    case 'mapping':
      return (
        <table className="block-mapping">
          <tbody>
            {block.rows.map(([left, right], i) => (
              <tr key={i}>
                <td style={{ color: block.leftColor }}>{left}</td>
                <td className="arrow">↔</td>
                <td style={{ color: block.rightColor }}>{right}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'table':
      return (
        <table className="block-table">
          <thead>
            <tr>
              {block.head.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'columns':
      return (
        <div className="block-columns">
          <div className="col before">
            <h3>{block.left.title}</h3>
            <ul>
              {block.left.items.map((item, i) => (
                <li key={i}>❌ {item}</li>
              ))}
            </ul>
          </div>
          <div className="col after">
            <h3>{block.right.title}</h3>
            <ul>
              {block.right.items.map((item, i) => (
                <li key={i}>✅ {item}</li>
              ))}
            </ul>
          </div>
        </div>
      )
    case 'code':
      return <div className="block-code">{block.lines.map(renderCode)}</div>
    case 'chips':
      return (
        <div className="block-chips">
          {block.label && <span className="chips-label">{block.label}</span>}
          {block.items.map((chip, i) => (
            <span className="chip" key={i}>
              {chip}
            </span>
          ))}
        </div>
      )
    case 'timer':
      return <Timer seconds={block.seconds} slideIndex={slideIndex} />
    case 'score':
      return <Score from={block.from} to={block.to} stars={block.stars} slideIndex={slideIndex} />
    case 'note':
      return <div className="block-note">{block.text}</div>
    case 'quote':
      return (
        <blockquote className="block-quote">
          « {block.text} »{block.author && <span className="author">— {block.author}</span>}
        </blockquote>
      )
    case 'links':
      return (
        <div className="block-links">
          {block.items.map((link, i) => (
            <a key={i} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      )
    case 'cycle':
      return (
        <div className="block-cycle">
          {block.steps.map((step, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="cycle-arrow">→</span>}
              <span className="step">{step}</span>
            </Fragment>
          ))}
        </div>
      )
    case 'slogan':
      return <div className="block-slogan">{block.text}</div>
  }
}

/** Les 22 slides en sections HTML pleine hauteur, alignées sur le scroll 3D */
export function Overlay() {
  // pendant la plongée d'ouverture, les cartes restent voilées ;
  // à la déflagration, la carte du héro claque à l'écran (animation CSS)
  const intro = useShow((s) => s.intro)
  return (
    <div className="overlay-root" data-intro={intro}>
      {slides.map((slide, i) => {
        const side = slide.align === 'center' ? 'center' : slide.align === 'right' || i % 2 === 1 ? 'right' : ''
        // anchor: 'bottom' (champ du modèle) laisse toute la place à la scène 3D
        const bottom = slide.anchor === 'bottom' ? { alignItems: 'flex-end' as const, paddingBottom: '4.5rem' } : undefined
        return (
          <section
            key={slide.id}
            className={`overlay-section ${side}`}
            style={{ top: `${i * 100}vh`, ...bottom }}
            data-accent={slide.accent}
            data-final={i === slides.length - 1 || undefined}>
            <div className="overlay-card">
              {slide.kicker && <div className="kicker">{slide.kicker}</div>}
              <h2>{slide.title}</h2>
              {slide.subtitle && <div className="subtitle">{slide.subtitle}</div>}
              {slide.blocks.map((block, j) => (
                <BlockView key={j} block={block} slideIndex={i} />
              ))}
              {slide.hint && <div className="hint">{slide.hint}</div>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
